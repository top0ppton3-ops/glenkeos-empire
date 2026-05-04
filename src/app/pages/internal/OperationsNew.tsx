import { useState } from "react";
import { motion } from "motion/react";
import { Package, ChefHat, AlertTriangle, Clock, Truck } from "lucide-react";
import { Tabs } from "../../components/navigation/Tabs";
import { KPITile } from "../../components/data/KPITile";
import { OrderCard } from "../../components/operational/OrderCard";
import { KDSTile } from "../../components/operational/KDSTile";
import { InventoryBlock } from "../../components/operational/InventoryBlock";
import { AssignDriverModal } from "../../components/operational/AssignDriverModal";
import { Loader } from "../../components/feedback/Loader";
import { Skeleton } from "../../components/feedback/Skeleton";
import { EmptyState } from "../../components/feedback/EmptyState";
import { ErrorState } from "../../components/feedback/ErrorState";
import { Alert } from "../../components/core/Alert";
import { MetricBlock } from "../../components/data/MetricBlock";
import { Button } from "../../components/core/Button";
import {
  useOpsMetrics,
  useOrders,
  useInventory,
  useUpdateOrderStatus
} from "../../hooks";
import { autoAssignAllReadyOrders } from "../../services/api";
import type { OrderStatus } from "../../types/backend";

export function OperationsNew() {
  const storeId = "store_001"; // TODO: Get from context or route
  const [selectedOrderTab, setSelectedOrderTab] = useState<OrderStatus | "ALL">("ALL");
  const [selectedKDSTab, setSelectedKDSTab] = useState<"ACCEPTED" | "IN_PREP" | "READY">(
    "ACCEPTED"
  );
  const [assignDriverModalOpen, setAssignDriverModalOpen] = useState(false);
  const [selectedOrderForDriver, setSelectedOrderForDriver] = useState<string | null>(null);
  const [autoAssigning, setAutoAssigning] = useState(false);

  // Data hooks
  const { data: metrics, isLoading: metricsLoading } = useOpsMetrics(storeId);

  const orderFilters =
    selectedOrderTab === "ALL" ? { store_id: storeId } : { status: selectedOrderTab, store_id: storeId };
  const { data: ordersData, isLoading: ordersLoading, error: ordersError, refetch: refetchOrders } =
    useOrders(orderFilters, { refetchInterval: 5000 });

  const kdsFilters = { status: selectedKDSTab, store_id: storeId };
  const { data: kdsData, isLoading: kdsLoading } = useOrders(kdsFilters, {
    refetchInterval: 3000
  });

  const { data: inventoryData, isLoading: inventoryLoading, error: inventoryError } =
    useInventory({ store_id: storeId });

  const updateOrderStatus = useUpdateOrderStatus();

  // Handlers
  const handleAssignDriver = (orderId: string) => {
    setSelectedOrderForDriver(orderId);
    setAssignDriverModalOpen(true);
  };

  const handleOrderStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    await updateOrderStatus.mutate({
      orderId,
      data: {
        new_status: newStatus,
        reason_code: "MANUAL_UPDATE"
      }
    });
    refetchOrders();
  };

  const handleAutoAssign = async () => {
    setAutoAssigning(true);
    try {
      await autoAssignAllReadyOrders();
      refetchOrders();
    } catch (error) {
      console.error('Auto-assign failed:', error);
    } finally {
      setAutoAssigning(false);
    }
  };

  // Filter low/out inventory items for alerts
  const alertInventory = inventoryData?.items.filter(
    item => item.quantity <= item.threshold_low
  ) || [];

  return (
    <div className="space-y-6">
      {/* Auto-Assign Button */}
      <div className="flex justify-between items-center">
        <h1 className="tracking-wider" style={{ fontSize: '1.5rem', fontWeight: 600 }}>
          Operations Dashboard
        </h1>
        <Button
          variant="primary"
          onClick={handleAutoAssign}
          disabled={autoAssigning}
          className="flex items-center gap-2"
        >
          <Truck className="w-4 h-4" />
          {autoAssigning ? 'Auto-Assigning...' : 'Auto-Assign Drivers'}
        </Button>
      </div>

      {/* Top KPI Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {metricsLoading ? (
          <>
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} variant="block" height="120px" />
            ))}
          </>
        ) : metrics ? (
          <>
            <KPITile
              title="Active Orders"
              value={metrics.active_orders.toString()}
              status={{ label: "LIVE", color: "info" }}
            />
            <KPITile
              title="Avg Prep Time"
              value={`${metrics.avg_prep_time_minutes}m`}
              trend={
                metrics.avg_prep_time_minutes < 12
                  ? { value: "On Target", direction: "up" }
                  : undefined
              }
            />
            <KPITile
              title="Out for Delivery"
              value={metrics.out_for_delivery.toString()}
              status={{ label: "EN ROUTE", color: "warning" }}
            />
            <KPITile
              title="Stockouts"
              value={metrics.stockouts.toString()}
              status={
                metrics.stockouts > 0
                  ? { label: "ACTION NEEDED", color: "error" }
                  : { label: "OK", color: "success" }
              }
            />
          </>
        ) : null}
      </div>

      {/* 3-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Column A: Live Order Queue */}
        <div className="lg:col-span-4">
          <div
            className="p-6"
            style={{
              backgroundColor: "var(--b1-obsidian-panel)",
              border: "1px solid var(--b1-border-subtle)",
              borderRadius: "var(--radius-lg)"
            }}
          >
            <h2
              className="mb-4 tracking-wider"
              style={{ fontSize: "1.25rem", fontWeight: 500 }}
            >
              Order Queue
            </h2>

            <Tabs
              tabs={[
                { id: "ALL", label: "All" },
                { id: "PENDING", label: "Pending" },
                { id: "ACCEPTED", label: "Accepted" },
                { id: "IN_PREP", label: "In Prep" },
                { id: "READY", label: "Ready" },
                { id: "OUT_FOR_DELIVERY", label: "Out" }
              ]}
              defaultTab={selectedOrderTab}
              onChange={tab => setSelectedOrderTab(tab as any)}
              variant="underline"
            />

            <div className="mt-6 space-y-4">
              {ordersLoading && <Loader variant="spinner" size="md" label="Loading orders..." />}

              {ordersError && (
                <ErrorState
                  title="Failed to load orders"
                  message={ordersError.error?.message || 'Unable to connect to server'}
                  onRetry={refetchOrders}
                />
              )}

              {!ordersLoading && !ordersError && (!ordersData || ordersData.orders.length === 0) && (
                <EmptyState title="No orders" description="No orders match the current filter" />
              )}

              {!ordersLoading &&
                !ordersError &&
                ordersData &&
                ordersData.orders.map(order => (
                  <OrderCard
                    key={order.order_id}
                    orderId={order.order_id}
                    customerName={order.customer_id}
                    itemsCount={order.items.length}
                    status={order.status}
                    prepTime={`${Math.floor(Math.random() * 15)}m`}
                    store={order.store_id}
                    variant="compact"
                    onClick={() => {
                      if (order.status === "READY") {
                        handleAssignDriver(order.order_id);
                      }
                    }}
                  />
                ))}
            </div>
          </div>
        </div>

        {/* Column B: KDS View */}
        <div className="lg:col-span-5">
          <div
            className="p-6"
            style={{
              backgroundColor: "var(--b1-obsidian-panel)",
              border: "1px solid var(--b1-border-subtle)",
              borderRadius: "var(--radius-lg)"
            }}
          >
            <div className="flex items-center gap-3 mb-4">
              <ChefHat className="w-6 h-6" style={{ color: "var(--b1-gold-trim)" }} />
              <h2 className="tracking-wider" style={{ fontSize: "1.25rem", fontWeight: 500 }}>
                Kitchen Display
              </h2>
            </div>

            <Tabs
              tabs={[
                { id: "ACCEPTED", label: "Accepted" },
                { id: "IN_PREP", label: "In Progress" },
                { id: "READY", label: "Ready" }
              ]}
              defaultTab={selectedKDSTab}
              onChange={tab => setSelectedKDSTab(tab as any)}
              variant="segmented"
            />

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              {kdsLoading && (
                <>
                  {[1, 2, 3, 4].map(i => (
                    <Skeleton key={i} variant="card" />
                  ))}
                </>
              )}

              {!kdsLoading && (!kdsData || kdsData.orders.length === 0) && (
                <div className="col-span-2">
                  <EmptyState title="No items" description="No items in this status" />
                </div>
              )}

              {!kdsLoading &&
                kdsData &&
                kdsData.orders.map(order => (
                  <KDSTile
                    key={order.order_id}
                    itemName={order.items[0]?.name || "Unknown Item"}
                    quantity={order.items.reduce((sum, item) => sum + item.quantity, 0)}
                    orderId={order.order_id}
                    station="Prep Station"
                    timer="3:24"
                    status={
                      order.status === "IN_PREP"
                        ? "in-progress"
                        : order.status === "READY"
                        ? "complete"
                        : "pending"
                    }
                  />
                ))}
            </div>
          </div>
        </div>

        {/* Column C: Inventory & Alerts */}
        <div className="lg:col-span-3">
          <div
            className="p-6"
            style={{
              backgroundColor: "var(--b1-obsidian-panel)",
              border: "1px solid var(--b1-border-subtle)",
              borderRadius: "var(--radius-lg)"
            }}
          >
            <div className="flex items-center gap-3 mb-4">
              <Package className="w-6 h-6" style={{ color: "var(--b1-gold-trim)" }} />
              <h2 className="tracking-wider" style={{ fontSize: "1.25rem", fontWeight: 500 }}>
                Inventory & Alerts
              </h2>
            </div>

            {/* Alerts Section */}
            {alertInventory.length > 0 && (
              <div className="mb-6 space-y-3">
                {alertInventory.slice(0, 3).map(item => (
                  <Alert
                    key={item.item_id}
                    variant={item.quantity === 0 ? "error" : "warning"}
                    title={item.quantity === 0 ? "Out of Stock" : "Low Stock"}
                    isDismissible
                  >
                    {item.name} - {item.quantity} {item.sku} remaining
                  </Alert>
                ))}
              </div>
            )}

            {/* Metrics */}
            <div className="mb-6 grid grid-cols-2 gap-4">
              <MetricBlock
                label="Low Stock"
                value={alertInventory.filter(i => i.quantity > 0).length.toString()}
                size="sm"
                icon={<AlertTriangle className="w-4 h-4" />}
              />
              <MetricBlock
                label="Stockouts"
                value={alertInventory.filter(i => i.quantity === 0).length.toString()}
                size="sm"
                icon={<AlertTriangle className="w-4 h-4" />}
              />
            </div>

            {/* Inventory List */}
            <div className="space-y-4">
              {inventoryLoading && <Loader variant="spinner" size="sm" />}

              {inventoryError && (
                <div className="text-sm" style={{ color: "var(--color-error)" }}>
                  Failed to load inventory
                </div>
              )}

              {!inventoryLoading &&
                !inventoryError &&
                inventoryData &&
                inventoryData.items.slice(0, 5).map(item => (
                  <InventoryBlock
                    key={item.item_id}
                    itemName={item.name}
                    sku={item.sku}
                    currentStock={item.quantity}
                    unit="units"
                    threshold={item.threshold_low}
                    status={
                      item.quantity === 0
                        ? "out-of-stock"
                        : item.quantity <= item.threshold_critical
                        ? "critical"
                        : item.quantity <= item.threshold_low
                        ? "low"
                        : "good"
                    }
                    variant="basic"
                  />
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* Assign Driver Modal */}
      {selectedOrderForDriver && (
        <AssignDriverModal
          isOpen={assignDriverModalOpen}
          onClose={() => {
            setAssignDriverModalOpen(false);
            setSelectedOrderForDriver(null);
          }}
          orderId={selectedOrderForDriver}
          storeId={storeId}
          onSuccess={refetchOrders}
        />
      )}
    </div>
  );
}
