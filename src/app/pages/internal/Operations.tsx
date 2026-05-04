import { motion } from "motion/react";
import { Package, Clock, AlertTriangle, CheckCircle2, Truck, Users, FileWarning, ChefHat } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";

export function Operations() {
  const { hasAnyRole } = useAuth();
  const [selectedTab, setSelectedTab] = useState<"orders" | "kitchen" | "inventory" | "delivery">("orders");

  const activeOrders = [
    {
      id: "ORD-12847",
      status: "In Progress",
      customer: "Sarah M.",
      items: 3,
      prepTime: "8 min",
      store: "Downtown Center",
      priority: "Normal"
    },
    {
      id: "ORD-12848",
      status: "Ready",
      customer: "James K.",
      items: 2,
      prepTime: "12 min",
      store: "Downtown Center",
      priority: "Normal"
    },
    {
      id: "ORD-12849",
      status: "In Progress",
      customer: "Maria L.",
      items: 5,
      prepTime: "15 min",
      store: "West Side",
      priority: "Rush"
    },
    {
      id: "ORD-12850",
      status: "Pending",
      customer: "David T.",
      items: 1,
      prepTime: "0 min",
      store: "East District",
      priority: "Normal"
    }
  ];

  const kitchenQueue = [
    {
      id: "KDS-001",
      item: "Classic Fried Chicken",
      quantity: 2,
      orderId: "ORD-12847",
      station: "Fry Station",
      timer: "3:24",
      status: "Cooking"
    },
    {
      id: "KDS-002",
      item: "Spicy Sandwich",
      quantity: 1,
      orderId: "ORD-12847",
      station: "Assembly",
      timer: "1:15",
      status: "Assembly"
    },
    {
      id: "KDS-003",
      item: "Tenders Combo",
      quantity: 3,
      orderId: "ORD-12849",
      station: "Fry Station",
      timer: "8:42",
      status: "Pending"
    },
    {
      id: "KDS-004",
      item: "Buffalo Wings",
      quantity: 2,
      orderId: "ORD-12848",
      station: "Sauce Station",
      timer: "0:00",
      status: "Complete"
    }
  ];

  const inventoryItems = [
    {
      id: "INV-001",
      name: "Chicken Breast",
      stock: 45,
      unit: "lbs",
      threshold: 50,
      status: "Low",
      location: "Downtown Center"
    },
    {
      id: "INV-002",
      name: "Chicken Tenders",
      stock: 120,
      unit: "lbs",
      threshold: 80,
      status: "Good",
      location: "Downtown Center"
    },
    {
      id: "INV-003",
      name: "Breading Mix",
      stock: 15,
      unit: "bags",
      threshold: 20,
      status: "Low",
      location: "West Side"
    },
    {
      id: "INV-004",
      name: "Buffalo Sauce",
      stock: 8,
      unit: "gal",
      threshold: 10,
      status: "Critical",
      location: "East District"
    }
  ];

  const deliveryRoutes = [
    {
      id: "DRV-101",
      driver: "Mike Johnson",
      status: "En Route",
      orders: 2,
      destination: "Central District",
      eta: "8 min",
      vehicle: "VAN-04"
    },
    {
      id: "DRV-102",
      driver: "Lisa Chen",
      status: "Picking Up",
      orders: 1,
      destination: "Downtown Center",
      eta: "2 min",
      vehicle: "VAN-07"
    },
    {
      id: "DRV-103",
      driver: "Robert Davis",
      status: "Delivered",
      orders: 3,
      destination: "West Side",
      eta: "Completed",
      vehicle: "VAN-12"
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="mb-2 tracking-wider" style={{ fontSize: '2rem', fontWeight: 500 }}>
            Rusty Link Operations
          </h1>
          <p className="text-sm" style={{ color: 'var(--b1-neutral-gray)' }}>
            Internal operations and logistics management
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 border" style={{ borderColor: 'var(--b1-border-subtle)' }}>
            <div className="text-xs mb-1" style={{ color: 'var(--b1-neutral-gray)' }}>ACTIVE ORDERS</div>
            <div className="text-2xl" style={{ fontWeight: 500, color: 'var(--b1-gold-minimal)' }}>47</div>
          </div>
          <div className="px-4 py-2 border" style={{ borderColor: 'var(--b1-border-subtle)' }}>
            <div className="text-xs mb-1" style={{ color: 'var(--b1-neutral-gray)' }}>AVG PREP TIME</div>
            <div className="text-2xl" style={{ fontWeight: 500 }}>12m</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b" style={{ borderBottomColor: 'var(--b1-border-subtle)' }}>
        <div className="flex gap-8">
          {[
            { id: "orders", label: "Order Queue", icon: Package },
            { id: "kitchen", label: "Kitchen Display", icon: ChefHat },
            { id: "inventory", label: "Inventory", icon: AlertTriangle },
            { id: "delivery", label: "Delivery", icon: Truck }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id as any)}
              className="flex items-center gap-2 px-4 py-3 border-b-2 tracking-wider text-sm transition-colors"
              style={{
                borderBottomColor: selectedTab === tab.id ? 'var(--b1-gold-trim)' : 'transparent',
                color: selectedTab === tab.id ? 'var(--b1-white-space)' : 'var(--b1-neutral-gray)'
              }}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Order Queue Tab */}
      {selectedTab === "orders" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="grid grid-cols-1 gap-4">
            {activeOrders.map((order) => (
              <div
                key={order.id}
                className="p-6 border"
                style={{ borderColor: 'var(--b1-border-subtle)', backgroundColor: 'var(--b1-obsidian-panel)' }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="tracking-wider" style={{ fontWeight: 500 }}>
                        {order.id}
                      </span>
                      <span
                        className="px-2 py-1 text-xs tracking-widest"
                        style={{
                          backgroundColor: order.status === 'Ready' ? 'var(--b1-gold-minimal)' : order.status === 'In Progress' ? '#D4AF37' : 'var(--b1-neutral-gray)',
                          color: 'var(--b1-black-marble)'
                        }}
                      >
                        {order.status.toUpperCase()}
                      </span>
                      {order.priority === 'Rush' && (
                        <span
                          className="px-2 py-1 text-xs tracking-widest"
                          style={{ backgroundColor: '#D4504D', color: 'var(--b1-white-space)' }}
                        >
                          RUSH
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <div className="text-xs mb-1" style={{ color: 'var(--b1-neutral-gray)' }}>CUSTOMER</div>
                        <div>{order.customer}</div>
                      </div>
                      <div>
                        <div className="text-xs mb-1" style={{ color: 'var(--b1-neutral-gray)' }}>ITEMS</div>
                        <div>{order.items}</div>
                      </div>
                      <div>
                        <div className="text-xs mb-1" style={{ color: 'var(--b1-neutral-gray)' }}>PREP TIME</div>
                        <div>{order.prepTime}</div>
                      </div>
                      <div>
                        <div className="text-xs mb-1" style={{ color: 'var(--b1-neutral-gray)' }}>STORE</div>
                        <div>{order.store}</div>
                      </div>
                    </div>
                  </div>
                  <button
                    className="px-4 py-2 text-xs tracking-wider"
                    style={{ backgroundColor: 'var(--b1-gold-minimal)', color: 'var(--b1-black-marble)' }}
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Kitchen Display Tab */}
      {selectedTab === "kitchen" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {kitchenQueue.map((item) => (
            <div
              key={item.id}
              className="p-6 border"
              style={{ borderColor: 'var(--b1-border-subtle)', backgroundColor: 'var(--b1-obsidian-panel)' }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className="px-2 py-1 text-xs tracking-widest"
                      style={{
                        backgroundColor: item.status === 'Complete' ? 'var(--b1-gold-minimal)' : item.status === 'Cooking' ? '#D4AF37' : item.status === 'Assembly' ? '#6B9BD1' : 'var(--b1-neutral-gray)',
                        color: 'var(--b1-black-marble)'
                      }}
                    >
                      {item.status.toUpperCase()}
                    </span>
                    <span className="text-xs" style={{ color: 'var(--b1-neutral-gray)' }}>
                      {item.station}
                    </span>
                  </div>
                  <h3 className="mb-1 tracking-wide" style={{ fontWeight: 500 }}>
                    {item.item}
                  </h3>
                  <div className="text-xs" style={{ color: 'var(--b1-neutral-gray)' }}>
                    Qty: {item.quantity} • Order: {item.orderId}
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 border" style={{ borderColor: 'var(--b1-border-subtle)' }}>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5" style={{ color: 'var(--b1-gold-trim)' }} />
                  <span className="text-sm" style={{ color: 'var(--b1-neutral-gray)' }}>TIMER</span>
                </div>
                <div className="text-2xl" style={{ fontWeight: 500 }}>
                  {item.timer}
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      )}

      {/* Inventory Tab */}
      {selectedTab === "inventory" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="border" style={{ borderColor: 'var(--b1-border-subtle)', backgroundColor: 'var(--b1-obsidian-panel)' }}>
            <div className="divide-y" style={{ borderColor: 'var(--b1-border-subtle)' }}>
              {inventoryItems.map((item) => (
                <div key={item.id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="tracking-wider" style={{ fontWeight: 500 }}>
                          {item.name}
                        </span>
                        <span
                          className="px-2 py-1 text-xs tracking-widest"
                          style={{
                            backgroundColor: item.status === 'Good' ? 'var(--b1-gold-minimal)' : item.status === 'Low' ? '#D4AF37' : '#D4504D',
                            color: 'var(--b1-black-marble)'
                          }}
                        >
                          {item.status.toUpperCase()}
                        </span>
                      </div>
                      <div className="grid grid-cols-4 gap-4 text-sm">
                        <div>
                          <div className="text-xs mb-1" style={{ color: 'var(--b1-neutral-gray)' }}>CURRENT STOCK</div>
                          <div>{item.stock} {item.unit}</div>
                        </div>
                        <div>
                          <div className="text-xs mb-1" style={{ color: 'var(--b1-neutral-gray)' }}>THRESHOLD</div>
                          <div>{item.threshold} {item.unit}</div>
                        </div>
                        <div>
                          <div className="text-xs mb-1" style={{ color: 'var(--b1-neutral-gray)' }}>LOCATION</div>
                          <div>{item.location}</div>
                        </div>
                        <div>
                          <div className="text-xs mb-1" style={{ color: 'var(--b1-neutral-gray)' }}>STATUS</div>
                          <div>{item.stock < item.threshold ? 'Reorder Required' : 'Adequate'}</div>
                        </div>
                      </div>
                    </div>
                    {item.status !== 'Good' && (
                      <button
                        className="px-4 py-2 border text-xs tracking-wider"
                        style={{ borderColor: 'var(--b1-gold-trim)', color: 'var(--b1-gold-trim)' }}
                      >
                        Reorder
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Delivery Tab */}
      {selectedTab === "delivery" && hasAnyRole(["SUPER_ADMIN", "OPS_DIRECTOR", "LOGISTICS_COORDINATOR"]) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="space-y-4"
        >
          {deliveryRoutes.map((route) => (
            <div
              key={route.id}
              className="p-6 border"
              style={{ borderColor: 'var(--b1-border-subtle)', backgroundColor: 'var(--b1-obsidian-panel)' }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="tracking-wider" style={{ fontWeight: 500 }}>
                      {route.driver}
                    </span>
                    <span
                      className="px-2 py-1 text-xs tracking-widest"
                      style={{
                        backgroundColor: route.status === 'Delivered' ? 'var(--b1-gold-minimal)' : route.status === 'En Route' ? '#D4AF37' : '#6B9BD1',
                        color: 'var(--b1-black-marble)'
                      }}
                    >
                      {route.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="grid grid-cols-5 gap-4 text-sm">
                    <div>
                      <div className="text-xs mb-1" style={{ color: 'var(--b1-neutral-gray)' }}>ROUTE ID</div>
                      <div>{route.id}</div>
                    </div>
                    <div>
                      <div className="text-xs mb-1" style={{ color: 'var(--b1-neutral-gray)' }}>ORDERS</div>
                      <div>{route.orders}</div>
                    </div>
                    <div>
                      <div className="text-xs mb-1" style={{ color: 'var(--b1-neutral-gray)' }}>DESTINATION</div>
                      <div>{route.destination}</div>
                    </div>
                    <div>
                      <div className="text-xs mb-1" style={{ color: 'var(--b1-neutral-gray)' }}>ETA</div>
                      <div>{route.eta}</div>
                    </div>
                    <div>
                      <div className="text-xs mb-1" style={{ color: 'var(--b1-neutral-gray)' }}>VEHICLE</div>
                      <div>{route.vehicle}</div>
                    </div>
                  </div>
                </div>
                <button
                  className="px-4 py-2 border text-xs tracking-wider"
                  style={{ borderColor: 'var(--b1-border-subtle)' }}
                >
                  Track Route
                </button>
              </div>
            </div>
          ))}
        </motion.div>
      )}

      {/* Access Denied for Delivery Tab */}
      {selectedTab === "delivery" && !hasAnyRole(["SUPER_ADMIN", "OPS_DIRECTOR", "LOGISTICS_COORDINATOR"]) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="p-12 border text-center"
          style={{ borderColor: 'var(--b1-border-subtle)', backgroundColor: 'var(--b1-obsidian-panel)' }}
        >
          <AlertTriangle className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--b1-neutral-gray)' }} />
          <div className="text-sm" style={{ color: 'var(--b1-neutral-gray)' }}>
            Access Restricted: Logistics clearance required
          </div>
        </motion.div>
      )}
    </div>
  );
}
