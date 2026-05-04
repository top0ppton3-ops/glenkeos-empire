/**
 * Real-time Drivers Hook
 * Subscribes to driver location and status changes via Supabase Realtime
 */

import { useEffect, useState } from "react";
import { supabase } from "../../../utils/supabase/client";
import { driversService } from "../services/api";
import type { Driver, DriverStatus } from "../types/backend";

interface UseRealtimeDriversOptions {
  status?: DriverStatus;
  enabled?: boolean;
}

export function useRealtimeDrivers(options: UseRealtimeDriversOptions = {}) {
  const { status, enabled = true } = options;
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    let isMounted = true;

    // Initial fetch
    const fetchDrivers = async () => {
      try {
        setLoading(true);
        const result = await driversService.getDrivers({ status });
        if (isMounted) {
          setDrivers(result.drivers);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err as Error);
          console.error('Failed to fetch drivers:', err);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchDrivers();

    // Set up real-time subscription for driver changes
    const channel = supabase
      .channel('drivers-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'drivers',
          filter: status ? `status=eq.${status}` : undefined,
        },
        (payload) => {
          console.log('Driver change detected:', payload);

          if (payload.eventType === 'INSERT') {
            const newDriver = payload.new as any;

            const transformedDriver: Driver = {
              driver_id: newDriver.id,
              type: newDriver.driver_type || 'HUMAN',
              name: newDriver.name,
              status: newDriver.status || 'OFFLINE',
              rating: newDriver.rating || 4.5,
              risk_score: newDriver.risk_score || 0,
              location: {
                lat: newDriver.current_location?.lat || 0,
                lng: newDriver.current_location?.lng || 0,
                updated_at: newDriver.updated_at
              },
              vehicle: {
                type: newDriver.vehicle_info?.type || 'CAR',
                plate: newDriver.vehicle_info?.plate || 'N/A'
              },
              performance: {
                on_time_rate: newDriver.on_time_rate || 0.95,
                completion_rate: newDriver.completion_rate || 0.98
              }
            };

            setDrivers(prev => [...prev, transformedDriver]);
          } else if (payload.eventType === 'UPDATE') {
            const updatedDriver = payload.new as any;

            setDrivers(prev =>
              prev.map(driver =>
                driver.driver_id === updatedDriver.id
                  ? {
                      ...driver,
                      status: updatedDriver.status,
                      location: {
                        lat: updatedDriver.current_location?.lat || driver.location.lat,
                        lng: updatedDriver.current_location?.lng || driver.location.lng,
                        updated_at: updatedDriver.updated_at
                      }
                    }
                  : driver
              )
            );
          } else if (payload.eventType === 'DELETE') {
            const deletedDriver = payload.old as any;
            setDrivers(prev => prev.filter(driver => driver.driver_id !== deletedDriver.id));
          }
        }
      )
      .subscribe((status) => {
        console.log('Realtime drivers subscription status:', status);
      });

    return () => {
      isMounted = false;
      channel.unsubscribe();
    };
  }, [status, enabled]);

  return {
    drivers,
    loading,
    error,
    refetch: async () => {
      setLoading(true);
      try {
        const result = await driversService.getDrivers({ status });
        setDrivers(result.drivers);
        setError(null);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    }
  };
}
