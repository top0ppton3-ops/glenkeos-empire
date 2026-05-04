import { motion } from "motion/react";
import { TrendingUp, TrendingDown, DollarSign, ShoppingBag, Users, Clock, AlertTriangle, Shield } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import api, { USE_MOCK } from "../../services/api";

export function Analytics() {
  const { hasAnyRole } = useAuth();
  const [timeRange, setTimeRange] = useState<"24h" | "7d" | "30d">("7d");
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Load analytics data
  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        setLoading(true);
        const data = await api.analytics.getDashboard();
        setAnalyticsData(data);
      } catch (error) {
        console.error('Failed to load analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, [timeRange]);

  // Use static data as fallback
  const operationalKPIs = analyticsData ? [
    { label: "Total Orders", value: analyticsData.totalOrders.toLocaleString(), change: "+12.3%", trend: "up", icon: ShoppingBag },
    { label: "Revenue", value: `$${analyticsData.totalRevenue.toLocaleString()}`, change: "+8.7%", trend: "up", icon: DollarSign },
    { label: "Avg Order Value", value: `$${analyticsData.averageOrderValue.toFixed(2)}`, change: "+2.1%", trend: "up", icon: TrendingUp },
    { label: "Customer Count", value: analyticsData.activeCustomers.toLocaleString(), change: "+15.2%", trend: "up", icon: Users }
  ] : [
    { label: "Total Orders", value: "1,247", change: "+12.3%", trend: "up", icon: ShoppingBag },
    { label: "Revenue", value: "$47,892", change: "+8.7%", trend: "up", icon: DollarSign },
    { label: "Avg Order Value", value: "$38.42", change: "+2.1%", trend: "up", icon: TrendingUp },
    { label: "Customer Count", value: "892", change: "+15.2%", trend: "up", icon: Users }
  ];

  const complianceKPIs = [
    { label: "Compliance Score", value: "100%", change: "0%", trend: "stable", icon: Shield },
    { label: "Audits Completed", value: "47", change: "+3", trend: "up", icon: Shield },
    { label: "Risk Events", value: "0", change: "-2", trend: "down", icon: AlertTriangle },
    { label: "Policy Reviews", value: "12", change: "+4", trend: "up", icon: Shield }
  ];

  const performanceMetrics = [
    { store: "Downtown Center", orders: 342, revenue: "$13,156", avgTime: "11 min", efficiency: "98%" },
    { store: "West Side", orders: 289, revenue: "$11,048", avgTime: "12 min", efficiency: "96%" },
    { store: "East District", orders: 316, revenue: "$12,164", avgTime: "10 min", efficiency: "99%" },
    { store: "North Plaza", orders: 300, revenue: "$11,524", avgTime: "13 min", efficiency: "95%" }
  ];

  const topItems = [
    { name: "Classic Fried Chicken", orders: 487, revenue: "$7,305", percentage: "39%" },
    { name: "Spicy Sandwich", orders: 392, revenue: "$5,488", percentage: "31%" },
    { name: "Tenders Combo", orders: 318, revenue: "$4,452", percentage: "26%" },
    { name: "Buffalo Wings", orders: 245, revenue: "$3,185", percentage: "20%" },
    { name: "Nashville Hot", orders: 187, revenue: "$2,618", percentage: "15%" }
  ];

  const riskMetrics = [
    { category: "Operational", score: 2.1, status: "Low", trend: "down" },
    { category: "Compliance", score: 1.3, status: "Low", trend: "stable" },
    { category: "Financial", score: 1.8, status: "Low", trend: "down" },
    { category: "Technology", score: 2.4, status: "Low", trend: "up" }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="mb-2 tracking-wider" style={{ fontSize: '2rem', fontWeight: 500 }}>
            Analytics & Insights
          </h1>
          <p className="text-sm" style={{ color: 'var(--b1-neutral-gray)' }}>
            Operational and compliance performance metrics
          </p>
        </div>
        <div className="flex items-center gap-3">
          {["24h", "7d", "30d"].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range as any)}
              className="px-4 py-2 text-xs tracking-wider transition-colors"
              style={{
                backgroundColor: timeRange === range ? 'var(--b1-gold-minimal)' : 'transparent',
                color: timeRange === range ? 'var(--b1-black-marble)' : 'var(--b1-neutral-gray)',
                border: timeRange === range ? 'none' : '1px solid var(--b1-border-subtle)'
              }}
            >
              {range.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Operational KPIs */}
      {hasAnyRole(["SUPER_ADMIN", "OPS_DIRECTOR", "STORE_MANAGER"]) && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="mb-4 tracking-wider" style={{ fontSize: '1.25rem', fontWeight: 500 }}>
            Operational Performance
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {operationalKPIs.map((kpi, index) => (
              <div
                key={index}
                className="p-6 border"
                style={{ borderColor: 'var(--b1-border-subtle)', backgroundColor: 'var(--b1-obsidian-panel)' }}
              >
                <div className="flex items-start justify-between mb-4">
                  <kpi.icon className="w-6 h-6" style={{ color: 'var(--b1-gold-trim)' }} />
                  <div className="flex items-center gap-1 text-xs" style={{ color: kpi.trend === 'up' ? 'var(--b1-gold-minimal)' : '#6B9BD1' }}>
                    {kpi.trend === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {kpi.change}
                  </div>
                </div>
                <div className="text-3xl mb-2" style={{ fontWeight: 500 }}>
                  {kpi.value}
                </div>
                <div className="text-sm" style={{ color: 'var(--b1-neutral-gray)' }}>
                  {kpi.label}
                </div>
              </div>
            ))}
          </div>
        </motion.section>
      )}

      {/* Compliance KPIs */}
      {hasAnyRole(["SUPER_ADMIN", "GRC_EXECUTIVE", "COC_COMMAND_LEAD", "COC_AUDITOR"]) && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <h2 className="mb-4 tracking-wider" style={{ fontSize: '1.25rem', fontWeight: 500 }}>
            Compliance Performance
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {complianceKPIs.map((kpi, index) => (
              <div
                key={index}
                className="p-6 border"
                style={{ borderColor: 'var(--b1-border-subtle)', backgroundColor: 'var(--b1-obsidian-panel)' }}
              >
                <div className="flex items-start justify-between mb-4">
                  <kpi.icon className="w-6 h-6" style={{ color: 'var(--b1-gold-trim)' }} />
                  <div className="flex items-center gap-1 text-xs" style={{ color: kpi.trend === 'down' ? 'var(--b1-gold-minimal)' : kpi.trend === 'up' ? '#6B9BD1' : 'var(--b1-neutral-gray)' }}>
                    {kpi.trend === 'up' && <TrendingUp className="w-3 h-3" />}
                    {kpi.trend === 'down' && <TrendingDown className="w-3 h-3" />}
                    {kpi.change}
                  </div>
                </div>
                <div className="text-3xl mb-2" style={{ fontWeight: 500 }}>
                  {kpi.value}
                </div>
                <div className="text-sm" style={{ color: 'var(--b1-neutral-gray)' }}>
                  {kpi.label}
                </div>
              </div>
            ))}
          </div>
        </motion.section>
      )}

      {/* Store Performance */}
      {hasAnyRole(["SUPER_ADMIN", "OPS_DIRECTOR"]) && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h2 className="mb-4 tracking-wider" style={{ fontSize: '1.25rem', fontWeight: 500 }}>
            Store Performance
          </h2>
          <div className="border" style={{ borderColor: 'var(--b1-border-subtle)', backgroundColor: 'var(--b1-obsidian-panel)' }}>
            <div className="grid grid-cols-5 gap-4 p-4 border-b text-xs tracking-wider" style={{ borderBottomColor: 'var(--b1-border-subtle)', color: 'var(--b1-neutral-gray)' }}>
              <div>STORE</div>
              <div>ORDERS</div>
              <div>REVENUE</div>
              <div>AVG PREP TIME</div>
              <div>EFFICIENCY</div>
            </div>
            <div className="divide-y" style={{ borderColor: 'var(--b1-border-subtle)' }}>
              {performanceMetrics.map((store, index) => (
                <div key={index} className="grid grid-cols-5 gap-4 p-4 text-sm">
                  <div style={{ fontWeight: 500 }}>{store.store}</div>
                  <div>{store.orders}</div>
                  <div>{store.revenue}</div>
                  <div>{store.avgTime}</div>
                  <div style={{ color: parseInt(store.efficiency) >= 98 ? 'var(--b1-gold-minimal)' : 'var(--b1-white-space)' }}>
                    {store.efficiency}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.section>
      )}

      {/* Top Performing Items */}
      {hasAnyRole(["SUPER_ADMIN", "OPS_DIRECTOR", "STORE_MANAGER"]) && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <h2 className="mb-4 tracking-wider" style={{ fontSize: '1.25rem', fontWeight: 500 }}>
            Top Performing Items
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {topItems.map((item, index) => (
              <div
                key={index}
                className="p-6 border"
                style={{ borderColor: 'var(--b1-border-subtle)', backgroundColor: 'var(--b1-obsidian-panel)' }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="mb-2 tracking-wide" style={{ fontWeight: 500 }}>
                      {item.name}
                    </div>
                    <div className="text-sm" style={{ color: 'var(--b1-neutral-gray)' }}>
                      {item.orders} orders • {item.revenue}
                    </div>
                  </div>
                  <div className="text-2xl" style={{ fontWeight: 500, color: 'var(--b1-gold-minimal)' }}>
                    {item.percentage}
                  </div>
                </div>
                <div className="h-2 bg-opacity-20" style={{ backgroundColor: 'var(--b1-border-subtle)' }}>
                  <div
                    className="h-full"
                    style={{
                      width: item.percentage,
                      backgroundColor: 'var(--b1-gold-minimal)'
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </motion.section>
      )}

      {/* Risk Metrics */}
      {hasAnyRole(["SUPER_ADMIN", "GRC_EXECUTIVE", "COC_COMMAND_LEAD", "RISK_ANALYST"]) && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <h2 className="mb-4 tracking-wider" style={{ fontSize: '1.25rem', fontWeight: 500 }}>
            Risk Assessment
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {riskMetrics.map((risk, index) => (
              <div
                key={index}
                className="p-6 border"
                style={{ borderColor: 'var(--b1-border-subtle)', backgroundColor: 'var(--b1-obsidian-panel)' }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="text-sm tracking-wider" style={{ color: 'var(--b1-neutral-gray)' }}>
                    {risk.category.toUpperCase()}
                  </div>
                  <span
                    className="px-2 py-1 text-xs tracking-widest"
                    style={{
                      backgroundColor: 'var(--b1-gold-minimal)',
                      color: 'var(--b1-black-marble)'
                    }}
                  >
                    {risk.status.toUpperCase()}
                  </span>
                </div>
                <div className="text-4xl mb-2" style={{ fontWeight: 500 }}>
                  {risk.score}
                </div>
                <div className="flex items-center gap-2 text-xs" style={{ color: risk.trend === 'down' ? 'var(--b1-gold-minimal)' : risk.trend === 'up' ? '#D4504D' : 'var(--b1-neutral-gray)' }}>
                  {risk.trend === 'up' && <TrendingUp className="w-3 h-3" />}
                  {risk.trend === 'down' && <TrendingDown className="w-3 h-3" />}
                  {risk.trend === 'up' ? 'Increasing' : risk.trend === 'down' ? 'Decreasing' : 'Stable'}
                </div>
              </div>
            ))}
          </div>
        </motion.section>
      )}
    </div>
  );
}