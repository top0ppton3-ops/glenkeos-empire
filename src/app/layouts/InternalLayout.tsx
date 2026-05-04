import { Outlet, Link, useLocation, Navigate } from "react-router";
import { motion } from "motion/react";
import { Shield, Package, BarChart3, Settings, LogOut, Bell, User, Rocket } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

export function InternalLayout() {
  const location = useLocation();
  const { user, logout, hasAnyRole } = useAuth();

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/internal/login" replace />;
  }

  // Navigation items based on role
  const navigationItems = [
    {
      path: "/internal",
      label: "Dashboard",
      icon: BarChart3,
      roles: ["SUPER_ADMIN", "GRC_EXECUTIVE", "COC_COMMAND_LEAD", "OPS_DIRECTOR"]
    },
    {
      path: "/internal/execution",
      label: "Execution",
      icon: Rocket,
      roles: ["SUPER_ADMIN", "GRC_EXECUTIVE", "COC_COMMAND_LEAD"]
    },
    {
      path: "/internal/compliance",
      label: "Compliance",
      icon: Shield,
      roles: ["SUPER_ADMIN", "GRC_EXECUTIVE", "COC_COMMAND_LEAD", "COC_AUDITOR", "COMPLIANCE_ANALYST"]
    },
    {
      path: "/internal/operations",
      label: "Operations",
      icon: Package,
      roles: ["SUPER_ADMIN", "OPS_DIRECTOR", "STORE_MANAGER", "KITCHEN_MANAGER", "LOGISTICS_COORDINATOR"]
    },
    {
      path: "/internal/analytics",
      label: "Analytics",
      icon: BarChart3,
      roles: ["SUPER_ADMIN", "GRC_EXECUTIVE", "COC_COMMAND_LEAD", "OPS_DIRECTOR"]
    },
    {
      path: "/internal/settings",
      label: "Settings",
      icon: Settings,
      roles: ["SUPER_ADMIN", "GRC_EXECUTIVE", "COC_COMMAND_LEAD", "OPS_DIRECTOR", "STORE_MANAGER"]
    }
  ];

  const visibleNavigation = navigationItems.filter(item =>
    hasAnyRole(item.roles)
  );

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: 'var(--b1-black-marble)' }}>
      {/* Sidebar Navigation */}
      <motion.aside
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="w-64 border-r flex flex-col"
        style={{ backgroundColor: 'var(--b1-obsidian)', borderRightColor: 'var(--b1-border-subtle)' }}
      >
        {/* Logo */}
        <div className="p-6 border-b" style={{ borderBottomColor: 'var(--b1-gold-trim)', backgroundColor: 'var(--b1-obsidian)' }}>
          <Link to="/" className="flex items-center gap-3">
            <div className="w-12 h-12 border-2 flex items-center justify-center" style={{ borderColor: 'var(--b1-gold-trim)', backgroundColor: 'var(--b1-black-marble)' }}>
              <Shield className="w-6 h-6" style={{ color: 'var(--b1-gold-trim)' }} />
            </div>
            <div>
              <div className="text-xl tracking-[0.3em]" style={{ fontWeight: 700, color: 'var(--b1-gold-trim)' }}>
                COC
              </div>
              <div className="text-[10px] tracking-[0.2em]" style={{ color: 'var(--b3-gold-micro)', fontWeight: 500 }}>
                COMMAND CENTER
              </div>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <div className="space-y-2">
            {visibleNavigation.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className="flex items-center gap-3 px-4 py-3 rounded transition-colors"
                  style={{
                    backgroundColor: isActive ? 'var(--b1-gold-minimal)' : 'transparent',
                    color: isActive ? 'var(--b1-black-marble)' : 'var(--b1-neutral-gray)'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) e.currentTarget.style.backgroundColor = 'var(--b1-obsidian-panel)';
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="text-sm tracking-wider">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* User Info & Logout */}
        <div className="p-4 border-t" style={{ borderTopColor: 'var(--b1-border-subtle)' }}>
          <div className="mb-3 px-4 py-2" style={{ backgroundColor: 'var(--b1-obsidian-panel)' }}>
            <div className="flex items-center gap-2 mb-1">
              <User className="w-4 h-4" style={{ color: 'var(--b1-gold-trim)' }} />
              <div className="text-sm" style={{ fontWeight: 500 }}>{user.name}</div>
            </div>
            <div className="text-xs" style={{ color: 'var(--b1-neutral-gray)' }}>
              {user.role.replace(/_/g, ' ')}
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-2 px-4 py-2 rounded text-sm tracking-wider transition-colors"
            style={{ color: 'var(--b1-neutral-gray)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--b1-obsidian-panel)';
              e.currentTarget.style.color = 'var(--b1-white-space)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = 'var(--b1-neutral-gray)';
            }}
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="h-16 border-b flex items-center justify-between px-6" style={{ backgroundColor: 'var(--b1-obsidian)', borderBottomColor: 'var(--b1-border-subtle)' }}>
          <div>
            <h1 className="text-lg tracking-wider" style={{ fontWeight: 500 }}>
              {visibleNavigation.find(item => item.path === location.pathname)?.label || 'Dashboard'}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative p-2 rounded transition-colors" style={{ color: 'var(--b1-neutral-gray)' }}>
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--b1-gold-minimal)' }}></span>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6" style={{ backgroundColor: 'var(--b1-black-marble)' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
