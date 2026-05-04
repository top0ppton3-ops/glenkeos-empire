import { motion } from "motion/react";
import { Shield, Package, AlertTriangle, TrendingUp, Clock, CheckCircle2 } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

export function InternalDashboard() {
  const { user, hasAnyRole } = useAuth();

  const complianceMetrics = [
    { label: "Compliance Rate", value: "100%", status: "good", icon: Shield },
    { label: "Open Audits", value: "3", status: "warning", icon: Clock },
    { label: "Risk Events", value: "0", status: "good", icon: CheckCircle2 },
    { label: "Policy Violations", value: "0", status: "good", icon: Shield }
  ];

  const operationsMetrics = [
    { label: "Active Orders", value: "47", status: "good", icon: Package },
    { label: "Avg Prep Time", value: "12 min", status: "good", icon: Clock },
    { label: "Inventory Alerts", value: "2", status: "warning", icon: AlertTriangle },
    { label: "Delivery Success", value: "98.5%", status: "good", icon: TrendingUp }
  ];

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="mb-2 tracking-wider" style={{ fontSize: '2rem', fontWeight: 500 }}>
          Welcome, {user?.name}
        </h1>
        <p className="text-sm" style={{ color: 'var(--b1-neutral-gray)' }}>
          {user?.role.replace(/_/g, ' ')} • {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </motion.div>

      {/* Compliance Metrics */}
      {hasAnyRole(["SUPER_ADMIN", "GRC_EXECUTIVE", "COC_COMMAND_LEAD", "COC_AUDITOR", "COMPLIANCE_ANALYST"]) && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <h2 className="mb-4 tracking-wider" style={{ fontSize: '1.25rem', fontWeight: 500 }}>
            Compliance Overview
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {complianceMetrics.map((metric, index) => (
              <div
                key={index}
                className="p-6 border"
                style={{ borderColor: 'var(--b1-border-subtle)', backgroundColor: 'var(--b1-obsidian-panel)' }}
              >
                <div className="flex items-start justify-between mb-4">
                  <metric.icon className="w-6 h-6" style={{ color: 'var(--b1-gold-trim)' }} />
                  <div
                    className="px-2 py-1 text-xs tracking-widest"
                    style={{
                      backgroundColor: metric.status === 'good' ? 'var(--b1-gold-minimal)' : '#D4504D',
                      color: 'var(--b1-black-marble)'
                    }}
                  >
                    {metric.status.toUpperCase()}
                  </div>
                </div>
                <div className="text-3xl mb-2" style={{ fontWeight: 500 }}>
                  {metric.value}
                </div>
                <div className="text-sm" style={{ color: 'var(--b1-neutral-gray)' }}>
                  {metric.label}
                </div>
              </div>
            ))}
          </div>
        </motion.section>
      )}

      {/* Operations Metrics */}
      {hasAnyRole(["SUPER_ADMIN", "OPS_DIRECTOR", "STORE_MANAGER", "KITCHEN_MANAGER"]) && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h2 className="mb-4 tracking-wider" style={{ fontSize: '1.25rem', fontWeight: 500 }}>
            Operations Overview
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {operationsMetrics.map((metric, index) => (
              <div
                key={index}
                className="p-6 border"
                style={{ borderColor: 'var(--b1-border-subtle)', backgroundColor: 'var(--b1-obsidian-panel)' }}
              >
                <div className="flex items-start justify-between mb-4">
                  <metric.icon className="w-6 h-6" style={{ color: 'var(--b1-gold-trim)' }} />
                  <div
                    className="px-2 py-1 text-xs tracking-widest"
                    style={{
                      backgroundColor: metric.status === 'good' ? 'var(--b1-gold-minimal)' : '#D4504D',
                      color: 'var(--b1-black-marble)'
                    }}
                  >
                    {metric.status.toUpperCase()}
                  </div>
                </div>
                <div className="text-3xl mb-2" style={{ fontWeight: 500 }}>
                  {metric.value}
                </div>
                <div className="text-sm" style={{ color: 'var(--b1-neutral-gray)' }}>
                  {metric.label}
                </div>
              </div>
            ))}
          </div>
        </motion.section>
      )}

      {/* Recent Activity */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <h2 className="mb-4 tracking-wider" style={{ fontSize: '1.25rem', fontWeight: 500 }}>
          Recent Activity
        </h2>
        <div className="border" style={{ borderColor: 'var(--b1-border-subtle)', backgroundColor: 'var(--b1-obsidian-panel)' }}>
          <div className="divide-y" style={{ borderColor: 'var(--b1-border-subtle)' }}>
            {[
              { time: "10 min ago", action: "Compliance audit completed", user: "COC Command", type: "compliance" },
              { time: "23 min ago", action: "Inventory alert: Low stock on chicken tenders", user: "System", type: "warning" },
              { time: "1 hour ago", action: "Order #12847 completed", user: "Kitchen Manager", type: "operations" },
              { time: "2 hours ago", action: "Risk assessment updated", user: "Risk Analyst", type: "compliance" },
              { time: "3 hours ago", action: "New store opened: Downtown Center", user: "Ops Director", type: "operations" }
            ].map((activity, index) => (
              <div key={index} className="p-4 flex items-start gap-4">
                <div className="w-2 h-2 rounded-full mt-2" style={{ backgroundColor: activity.type === 'warning' ? '#D4504D' : 'var(--b1-gold-minimal)' }}></div>
                <div className="flex-1">
                  <div className="text-sm mb-1">{activity.action}</div>
                  <div className="text-xs" style={{ color: 'var(--b1-neutral-gray)' }}>
                    {activity.user} • {activity.time}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.section>
    </div>
  );
}
