import { motion } from "motion/react";
import { User, Bell, Shield, Key, Globe, Database, Mail, Smartphone } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";

export function Settings() {
  const { user, hasAnyRole } = useAuth();
  const [selectedTab, setSelectedTab] = useState<"profile" | "notifications" | "security" | "system">("profile");

  const notificationChannels = [
    { id: "email", label: "Email Notifications", enabled: true, icon: Mail },
    { id: "sms", label: "SMS Alerts", enabled: true, icon: Smartphone },
    { id: "push", label: "Push Notifications", enabled: false, icon: Bell },
    { id: "inapp", label: "In-App Notifications", enabled: true, icon: Bell }
  ];

  const securitySettings = [
    { id: "2fa", label: "Two-Factor Authentication", status: "Enabled", type: "security" },
    { id: "session", label: "Session Timeout", value: "30 minutes", type: "security" },
    { id: "ip", label: "IP Whitelist", status: "Active", type: "security" },
    { id: "audit", label: "Audit Logging", status: "Enabled", type: "security" }
  ];

  const systemSettings = [
    { id: "api", label: "API Access", status: "Enabled", endpoint: "/internal/api/v1" },
    { id: "backup", label: "Auto Backup", frequency: "Daily at 2:00 AM", lastBackup: "2026-04-14 02:00" },
    { id: "retention", label: "Data Retention", period: "7 years (compliance)" },
    { id: "encryption", label: "Encryption Standard", value: "AES-256, TLS 1.2+" }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="mb-2 tracking-wider" style={{ fontSize: '2rem', fontWeight: 500 }}>
            Settings
          </h1>
          <p className="text-sm" style={{ color: 'var(--b1-neutral-gray)' }}>
            System configuration and user preferences
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b" style={{ borderBottomColor: 'var(--b1-border-subtle)' }}>
        <div className="flex gap-8">
          {[
            { id: "profile", label: "Profile", icon: User },
            { id: "notifications", label: "Notifications", icon: Bell },
            { id: "security", label: "Security", icon: Shield },
            { id: "system", label: "System", icon: Database, roles: ["SUPER_ADMIN", "GRC_EXECUTIVE"] }
          ].map((tab) => {
            // Filter tabs based on roles if specified
            if (tab.roles && !hasAnyRole(tab.roles)) return null;

            return (
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
            );
          })}
        </div>
      </div>

      {/* Profile Tab */}
      {selectedTab === "profile" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          <div className="p-8 border" style={{ borderColor: 'var(--b1-border-subtle)', backgroundColor: 'var(--b1-obsidian-panel)' }}>
            <h3 className="mb-6 tracking-wider" style={{ fontSize: '1.125rem', fontWeight: 500 }}>
              User Information
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm mb-2 tracking-wider" style={{ color: 'var(--b1-neutral-gray)' }}>
                    NAME
                  </label>
                  <div className="p-3 border" style={{ borderColor: 'var(--b1-border-subtle)', backgroundColor: 'var(--b1-black-marble)' }}>
                    {user?.name}
                  </div>
                </div>
                <div>
                  <label className="block text-sm mb-2 tracking-wider" style={{ color: 'var(--b1-neutral-gray)' }}>
                    EMAIL
                  </label>
                  <div className="p-3 border" style={{ borderColor: 'var(--b1-border-subtle)', backgroundColor: 'var(--b1-black-marble)' }}>
                    {user?.email}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm mb-2 tracking-wider" style={{ color: 'var(--b1-neutral-gray)' }}>
                    ROLE
                  </label>
                  <div className="p-3 border" style={{ borderColor: 'var(--b1-border-subtle)', backgroundColor: 'var(--b1-black-marble)' }}>
                    {user?.role.replace(/_/g, ' ')}
                  </div>
                </div>
                <div>
                  <label className="block text-sm mb-2 tracking-wider" style={{ color: 'var(--b1-neutral-gray)' }}>
                    USER ID
                  </label>
                  <div className="p-3 border" style={{ borderColor: 'var(--b1-border-subtle)', backgroundColor: 'var(--b1-black-marble)' }}>
                    {user?.id}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-8 border" style={{ borderColor: 'var(--b1-border-subtle)', backgroundColor: 'var(--b1-obsidian-panel)' }}>
            <h3 className="mb-6 tracking-wider" style={{ fontSize: '1.125rem', fontWeight: 500 }}>
              Permissions
            </h3>
            <div className="flex flex-wrap gap-2">
              {user?.permissions.map((permission, index) => (
                <span
                  key={index}
                  className="px-3 py-1 text-xs tracking-wider border"
                  style={{ borderColor: 'var(--b1-gold-trim)', color: 'var(--b1-gold-trim)' }}
                >
                  {permission}
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Notifications Tab */}
      {selectedTab === "notifications" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          <div className="p-8 border" style={{ borderColor: 'var(--b1-border-subtle)', backgroundColor: 'var(--b1-obsidian-panel)' }}>
            <h3 className="mb-6 tracking-wider" style={{ fontSize: '1.125rem', fontWeight: 500 }}>
              Notification Channels
            </h3>
            <div className="space-y-4">
              {notificationChannels.map((channel) => (
                <div key={channel.id} className="flex items-center justify-between p-4 border" style={{ borderColor: 'var(--b1-border-subtle)' }}>
                  <div className="flex items-center gap-3">
                    <channel.icon className="w-5 h-5" style={{ color: 'var(--b1-gold-trim)' }} />
                    <div>
                      <div className="text-sm mb-1" style={{ fontWeight: 500 }}>{channel.label}</div>
                      <div className="text-xs" style={{ color: 'var(--b1-neutral-gray)' }}>
                        {channel.enabled ? 'Receiving notifications' : 'Notifications disabled'}
                      </div>
                    </div>
                  </div>
                  <div
                    className="w-12 h-6 rounded-full relative cursor-pointer transition-colors"
                    style={{ backgroundColor: channel.enabled ? 'var(--b1-gold-minimal)' : 'var(--b1-border-subtle)' }}
                  >
                    <div
                      className="w-4 h-4 rounded-full absolute top-1 transition-all"
                      style={{
                        backgroundColor: 'var(--b1-white-space)',
                        left: channel.enabled ? '28px' : '4px'
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-8 border" style={{ borderColor: 'var(--b1-border-subtle)', backgroundColor: 'var(--b1-obsidian-panel)' }}>
            <h3 className="mb-4 tracking-wider" style={{ fontSize: '1.125rem', fontWeight: 500 }}>
              Event Types
            </h3>
            <div className="text-sm space-y-2" style={{ color: 'var(--b1-neutral-gray)' }}>
              <div>• Compliance audit results</div>
              <div>• Risk event notifications</div>
              <div>• Operational alerts</div>
              <div>• System status updates</div>
              <div>• Policy review reminders</div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Security Tab */}
      {selectedTab === "security" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          <div className="p-8 border" style={{ borderColor: 'var(--b1-border-subtle)', backgroundColor: 'var(--b1-obsidian-panel)' }}>
            <h3 className="mb-6 tracking-wider" style={{ fontSize: '1.125rem', fontWeight: 500 }}>
              Security Settings
            </h3>
            <div className="space-y-4">
              {securitySettings.map((setting) => (
                <div key={setting.id} className="flex items-center justify-between p-4 border" style={{ borderColor: 'var(--b1-border-subtle)' }}>
                  <div className="flex items-center gap-3">
                    <Key className="w-5 h-5" style={{ color: 'var(--b1-gold-trim)' }} />
                    <div>
                      <div className="text-sm mb-1" style={{ fontWeight: 500 }}>{setting.label}</div>
                      <div className="text-xs" style={{ color: 'var(--b1-neutral-gray)' }}>
                        {setting.value || setting.status}
                      </div>
                    </div>
                  </div>
                  <span
                    className="px-3 py-1 text-xs tracking-widest"
                    style={{
                      backgroundColor: 'var(--b1-gold-minimal)',
                      color: 'var(--b1-black-marble)'
                    }}
                  >
                    ACTIVE
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-8 border" style={{ borderColor: 'var(--b1-border-subtle)', backgroundColor: 'var(--b1-obsidian-panel)' }}>
            <h3 className="mb-4 tracking-wider" style={{ fontSize: '1.125rem', fontWeight: 500 }}>
              Password Management
            </h3>
            <button
              className="px-6 py-3 border text-sm tracking-wider transition-colors"
              style={{ borderColor: 'var(--b1-gold-trim)', color: 'var(--b1-gold-trim)' }}
            >
              Change Password
            </button>
          </div>
        </motion.div>
      )}

      {/* System Tab */}
      {selectedTab === "system" && hasAnyRole(["SUPER_ADMIN", "GRC_EXECUTIVE"]) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          <div className="p-8 border" style={{ borderColor: 'var(--b1-border-subtle)', backgroundColor: 'var(--b1-obsidian-panel)' }}>
            <h3 className="mb-6 tracking-wider" style={{ fontSize: '1.125rem', fontWeight: 500 }}>
              System Configuration
            </h3>
            <div className="space-y-4">
              {systemSettings.map((setting) => (
                <div key={setting.id} className="p-4 border" style={{ borderColor: 'var(--b1-border-subtle)' }}>
                  <div className="flex items-start justify-between mb-2">
                    <div className="text-sm" style={{ fontWeight: 500 }}>{setting.label}</div>
                    <span
                      className="px-2 py-1 text-xs tracking-widest"
                      style={{
                        backgroundColor: 'var(--b1-gold-minimal)',
                        color: 'var(--b1-black-marble)'
                      }}
                    >
                      {setting.status || 'ACTIVE'}
                    </span>
                  </div>
                  <div className="text-xs space-y-1" style={{ color: 'var(--b1-neutral-gray)' }}>
                    {setting.endpoint && <div>Endpoint: {setting.endpoint}</div>}
                    {setting.frequency && <div>Schedule: {setting.frequency}</div>}
                    {setting.lastBackup && <div>Last Backup: {setting.lastBackup}</div>}
                    {setting.period && <div>Period: {setting.period}</div>}
                    {setting.value && <div>Standard: {setting.value}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-8 border" style={{ borderColor: 'var(--b1-border-subtle)', backgroundColor: 'var(--b1-obsidian-panel)' }}>
            <h3 className="mb-4 tracking-wider" style={{ fontSize: '1.125rem', fontWeight: 500 }}>
              API Documentation
            </h3>
            <div className="text-sm mb-4" style={{ color: 'var(--b1-neutral-gray)' }}>
              Internal API endpoint: <span style={{ color: 'var(--b1-gold-trim)' }}>/internal/api/v1</span>
            </div>
            <button
              className="px-6 py-3 text-sm tracking-wider"
              style={{ backgroundColor: 'var(--b1-gold-minimal)', color: 'var(--b1-black-marble)' }}
            >
              View API Docs
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
