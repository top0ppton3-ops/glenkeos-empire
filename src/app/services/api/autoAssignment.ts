/**
 * Auto-Assignment Service
 * Automatically assigns drivers to orders based on availability, location, and performance
 */

import { supabaseAPI } from "./supabaseAPI";
import { toast } from "react-hot-toast";

interface DriverScore {
  driver_id: string;
  score: number;
  distance?: number;
  rating: number;
  name: string;
}

/**
 * Calculate distance between two points using Haversine formula
 */
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Auto-assign the best available driver to an order
 */
export async function autoAssignDriver(orderId: string): Promise<boolean> {
  try {
    // Get order details
    const order = await supabaseAPI.orders.get(orderId);

    if (!order || order.driver_id) {
      console.log('Order already has a driver assigned');
      return false;
    }

    // Get store location (for simplicity, using hardcoded locations)
    // In production, this would query the stores table
    const storeLocation = { lat: 40.7128, lng: -74.0060 }; // NYC default

    // Get all available drivers
    const driversResult = await supabaseAPI.drivers.list({ status: 'ONLINE' });
    const availableDrivers = driversResult.drivers;

    if (availableDrivers.length === 0) {
      console.log('No available drivers found');
      toast.error('No drivers available for assignment');
      return false;
    }

    // Score each driver based on:
    // - Distance to store (40% weight)
    // - Driver rating (30% weight)
    // - Completion rate (20% weight)
    // - On-time rate (10% weight)
    const driverScores: DriverScore[] = availableDrivers.map((driver: any) => {
      const driverLat = driver.current_location?.lat || storeLocation.lat;
      const driverLng = driver.current_location?.lng || storeLocation.lng;

      const distance = calculateDistance(
        storeLocation.lat,
        storeLocation.lng,
        driverLat,
        driverLng
      );

      // Normalize distance to 0-100 scale (closer is better)
      // Assume max distance is 20km
      const distanceScore = Math.max(0, 100 - (distance / 20) * 100);

      // Normalize rating to 0-100 scale
      const ratingScore = ((driver.rating || 4.0) / 5.0) * 100;

      // Performance scores (already in 0-1 range)
      const completionScore = (driver.completion_rate || 0.95) * 100;
      const onTimeScore = (driver.on_time_rate || 0.95) * 100;

      // Weighted final score
      const finalScore =
        distanceScore * 0.4 +
        ratingScore * 0.3 +
        completionScore * 0.2 +
        onTimeScore * 0.1;

      return {
        driver_id: driver.id,
        score: finalScore,
        distance,
        rating: driver.rating || 4.0,
        name: driver.name
      };
    });

    // Sort by score (highest first)
    driverScores.sort((a, b) => b.score - a.score);

    // Assign the best driver
    const bestDriver = driverScores[0];

    console.log('Auto-assigning driver:', {
      orderId,
      driverId: bestDriver.driver_id,
      driverName: bestDriver.name,
      score: bestDriver.score.toFixed(2),
      distance: bestDriver.distance?.toFixed(2) + 'km',
      rating: bestDriver.rating
    });

    await supabaseAPI.orders.assignDriver(orderId, bestDriver.driver_id);

    toast.success(`Driver ${bestDriver.name} assigned to order`);

    return true;
  } catch (error) {
    console.error('Auto-assignment failed:', error);
    toast.error('Failed to auto-assign driver');
    return false;
  }
}

/**
 * Batch auto-assign drivers to all ready orders without drivers
 */
export async function autoAssignAllReadyOrders(): Promise<number> {
  try {
    const ordersResult = await supabaseAPI.orders.list({ status: 'READY' });
    const readyOrders = ordersResult.orders.filter((o: any) => !o.driver_id);

    let successCount = 0;

    for (const order of readyOrders) {
      const success = await autoAssignDriver(order.id);
      if (success) successCount++;

      // Add small delay between assignments to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    if (successCount > 0) {
      toast.success(`Auto-assigned ${successCount} driver(s)`);
    }

    return successCount;
  } catch (error) {
    console.error('Batch auto-assignment failed:', error);
    return 0;
  }
}
