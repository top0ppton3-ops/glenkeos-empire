import { useState } from "react";
import { Modal } from "../core/Modal";
import { Button } from "../core/Button";
import { List, ListItem } from "../data/List";
import { Avatar } from "../core/Avatar";
import { StatusIndicator } from "../data/StatusIndicator";
import { Loader } from "../feedback/Loader";
import { ErrorState } from "../feedback/ErrorState";
import { EmptyState } from "../feedback/EmptyState";
import { useDrivers } from "../../hooks";
import { useAssignDriver } from "../../hooks/useOrders";
import type { Driver } from "../../types/backend";

export interface AssignDriverModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  storeId?: string;
  onSuccess?: () => void;
}

export const AssignDriverModal: React.FC<AssignDriverModalProps> = ({
  isOpen,
  onClose,
  orderId,
  storeId,
  onSuccess
}) => {
  const [selectedDriver, setSelectedDriver] = useState<string | null>(null);

  const { data: driversData, isLoading, error, refetch } = useDrivers(
    { status: "ONLINE", limit: 100 },
    { enabled: isOpen }
  );

  const assignDriver = useAssignDriver();

  const handleAssign = async () => {
    if (!selectedDriver) return;

    try {
      await assignDriver.mutate({
        orderId,
        data: {
          driver_id: selectedDriver,
          assignment_reason: "MANUAL_ASSIGNMENT",
          override: false
        }
      });

      onSuccess?.();
      onClose();
      setSelectedDriver(null);
    } catch (err) {
      // Error is handled by the mutation hook
    }
  };

  const getDriverInitials = (driver: Driver) => {
    return driver.name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Assign Driver"
      size="md"
      footer={
        <div className="flex gap-3 justify-end">
          <Button variant="tertiary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleAssign}
            disabled={!selectedDriver}
            isLoading={assignDriver.isLoading}
          >
            Assign Driver
          </Button>
        </div>
      }
    >
      {isLoading && <Loader variant="spinner" size="lg" label="Loading drivers..." />}

      {error && (
        <ErrorState
          title="Failed to load drivers"
          message={error.error.message}
          onRetry={refetch}
        />
      )}

      {!isLoading && !error && (!driversData || driversData.drivers.length === 0) && (
        <EmptyState
          title="No available drivers"
          description="No drivers are currently online"
        />
      )}

      {!isLoading && !error && driversData && driversData.drivers.length > 0 && (
        <div>
          <div className="mb-4 text-sm" style={{ color: "var(--b1-neutral-gray)" }}>
            {driversData.drivers.length} driver{driversData.drivers.length !== 1 ? "s" : ""}{" "}
            available
          </div>

          <List variant="interactive">
            {driversData.drivers.map(driver => (
              <ListItem
                key={driver.driver_id}
                leadingAvatar={
                  <Avatar
                    variant="circle"
                    size="md"
                    initials={getDriverInitials(driver)}
                  />
                }
                title={driver.name}
                subtitle={
                  <div className="flex items-center gap-2 mt-1">
                    <StatusIndicator variant="dot-label" color="success" label="Online" />
                    <span>•</span>
                    <span>Rating: {driver.rating.toFixed(1)}</span>
                    <span>•</span>
                    <span>{driver.vehicle.type}</span>
                  </div>
                }
                trailingAction={
                  selectedDriver === driver.driver_id ? (
                    <div
                      className="px-3 py-1 text-xs tracking-wider"
                      style={{
                        backgroundColor: "var(--b1-gold-minimal)",
                        color: "var(--b1-black-marble)",
                        borderRadius: "var(--radius-md)"
                      }}
                    >
                      SELECTED
                    </div>
                  ) : null
                }
                onClick={() => setSelectedDriver(driver.driver_id)}
                variant="interactive"
              />
            ))}
          </List>
        </div>
      )}

      {assignDriver.error && (
        <div className="mt-4">
          <div
            className="p-3 text-sm"
            style={{
              backgroundColor: "rgba(211, 47, 47, 0.1)",
              border: "1px solid var(--color-error)",
              borderRadius: "var(--radius-md)",
              color: "var(--color-error)"
            }}
          >
            {assignDriver.error.error.message}
          </div>
        </div>
      )}
    </Modal>
  );
};
