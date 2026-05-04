import { motion } from "motion/react";
import { Shield, FileText, AlertTriangle, CheckCircle2, Download, Eye, Search } from "lucide-react";
import { useState } from "react";

export function Compliance() {
  const [selectedTab, setSelectedTab] = useState<"audits" | "risks" | "policies">("audits");

  const auditLogs = [
    {
      id: "AUD-2026-047",
      type: "Entity Separation",
      status: "Passed",
      date: "2026-04-14 09:23",
      auditor: "COC Command",
      findings: 0
    },
    {
      id: "AUD-2026-046",
      type: "Financial Commingling",
      status: "Passed",
      date: "2026-04-13 14:15",
      auditor: "COC Command",
      findings: 0
    },
    {
      id: "AUD-2026-045",
      type: "Data Privacy Compliance",
      status: "In Review",
      date: "2026-04-12 11:30",
      auditor: "Compliance Analyst",
      findings: 2
    },
    {
      id: "AUD-2026-044",
      type: "Food Safety Standards",
      status: "Passed",
      date: "2026-04-11 08:45",
      auditor: "External Auditor",
      findings: 0
    }
  ];

  const riskEvents = [
    {
      id: "RISK-089",
      severity: "Medium",
      category: "Operational",
      description: "Inventory shortage at West Side location",
      status: "Mitigated",
      date: "2026-04-13"
    },
    {
      id: "RISK-088",
      severity: "Low",
      category: "Technology",
      description: "Payment gateway latency spike",
      status: "Resolved",
      date: "2026-04-12"
    },
    {
      id: "RISK-087",
      severity: "High",
      category: "Compliance",
      description: "Expired food safety certification at East District",
      status: "Critical",
      date: "2026-04-10"
    }
  ];

  const policies = [
    {
      id: "POL-001",
      title: "Entity Separation Policy",
      version: "v3.2",
      status: "Active",
      lastReview: "2026-03-15",
      nextReview: "2026-06-15"
    },
    {
      id: "POL-002",
      title: "Data Privacy Policy",
      version: "v4.1",
      status: "Active",
      lastReview: "2026-04-01",
      nextReview: "2026-07-01"
    },
    {
      id: "POL-003",
      title: "Food Safety Standards",
      version: "v2.8",
      status: "Active",
      lastReview: "2026-02-20",
      nextReview: "2026-05-20"
    },
    {
      id: "POL-004",
      title: "Incident Response Plan",
      version: "v1.9",
      status: "Under Review",
      lastReview: "2026-03-10",
      nextReview: "2026-06-10"
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="mb-2 tracking-wider" style={{ fontSize: '2rem', fontWeight: 500 }}>
            Compliance & COC Command
          </h1>
          <p className="text-sm" style={{ color: 'var(--b1-neutral-gray)' }}>
            Internal regulatory authority and compliance monitoring
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 border tracking-wider text-sm transition-colors" style={{ borderColor: 'var(--b1-gold-trim)', color: 'var(--b1-gold-trim)' }}>
            <Download className="w-4 h-4 inline mr-2" />
            Export Report
          </button>
        </div>
      </div>

      {/* Compliance Score */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-8 border"
        style={{ borderColor: 'var(--b1-gold-trim)', backgroundColor: 'var(--b1-obsidian-panel)' }}
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm mb-2 tracking-wider" style={{ color: 'var(--b1-neutral-gray)' }}>
              OVERALL COMPLIANCE RATE
            </div>
            <div className="text-6xl mb-2" style={{ fontWeight: 500, color: 'var(--b1-gold-minimal)' }}>
              100%
            </div>
            <div className="text-sm" style={{ color: 'var(--b1-neutral-gray)' }}>
              All divisions compliant • Last updated: {new Date().toLocaleString()}
            </div>
          </div>
          <div className="w-32 h-32 border rounded-full flex items-center justify-center" style={{ borderColor: 'var(--b1-gold-trim)', borderWidth: '4px' }}>
            <CheckCircle2 className="w-16 h-16" style={{ color: 'var(--b1-gold-minimal)' }} />
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="border-b" style={{ borderBottomColor: 'var(--b1-border-subtle)' }}>
        <div className="flex gap-8">
          {[
            { id: "audits", label: "Audit Logs", icon: FileText },
            { id: "risks", label: "Risk Events", icon: AlertTriangle },
            { id: "policies", label: "Policies", icon: Shield }
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

      {/* Audit Logs Tab */}
      {selectedTab === "audits" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="mb-4 flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--b1-neutral-gray)' }} />
              <input
                type="text"
                placeholder="Search audits..."
                className="w-full pl-10 pr-4 py-2 border outline-none"
                style={{
                  backgroundColor: 'var(--b1-obsidian-panel)',
                  borderColor: 'var(--b1-border-subtle)',
                  color: 'var(--b1-white-space)'
                }}
              />
            </div>
          </div>

          <div className="border" style={{ borderColor: 'var(--b1-border-subtle)', backgroundColor: 'var(--b1-obsidian-panel)' }}>
            <div className="divide-y" style={{ borderColor: 'var(--b1-border-subtle)' }}>
              {auditLogs.map((audit) => (
                <div key={audit.id} className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="tracking-wider" style={{ fontWeight: 500 }}>
                          {audit.id}
                        </span>
                        <span
                          className="px-2 py-1 text-xs tracking-widest"
                          style={{
                            backgroundColor: audit.status === 'Passed' ? 'var(--b1-gold-minimal)' : audit.status === 'In Review' ? '#D4AF37' : '#D4504D',
                            color: 'var(--b1-black-marble)'
                          }}
                        >
                          {audit.status.toUpperCase()}
                        </span>
                      </div>
                      <div className="text-sm mb-2">{audit.type}</div>
                      <div className="text-xs" style={{ color: 'var(--b1-neutral-gray)' }}>
                        {audit.auditor} • {audit.date} • {audit.findings} findings
                      </div>
                    </div>
                    <button className="p-2 border" style={{ borderColor: 'var(--b1-border-subtle)' }}>
                      <Eye className="w-4 h-4" style={{ color: 'var(--b1-neutral-gray)' }} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Risk Events Tab */}
      {selectedTab === "risks" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="space-y-4"
        >
          {riskEvents.map((risk) => (
            <div
              key={risk.id}
              className="p-6 border"
              style={{ borderColor: 'var(--b1-border-subtle)', backgroundColor: 'var(--b1-obsidian-panel)' }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="tracking-wider" style={{ fontWeight: 500 }}>
                      {risk.id}
                    </span>
                    <span
                      className="px-2 py-1 text-xs tracking-widest"
                      style={{
                        backgroundColor: risk.severity === 'High' ? '#D4504D' : risk.severity === 'Medium' ? '#D4AF37' : 'var(--b1-gold-minimal)',
                        color: 'var(--b1-black-marble)'
                      }}
                    >
                      {risk.severity.toUpperCase()}
                    </span>
                    <span className="text-xs px-2 py-1 border" style={{ borderColor: 'var(--b1-border-subtle)', color: 'var(--b1-neutral-gray)' }}>
                      {risk.category}
                    </span>
                  </div>
                  <div className="text-sm mb-2">{risk.description}</div>
                  <div className="text-xs" style={{ color: 'var(--b1-neutral-gray)' }}>
                    {risk.date} • Status: {risk.status}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      )}

      {/* Policies Tab */}
      {selectedTab === "policies" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {policies.map((policy) => (
            <div
              key={policy.id}
              className="p-6 border"
              style={{ borderColor: 'var(--b1-border-subtle)', backgroundColor: 'var(--b1-obsidian-panel)' }}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs tracking-widest" style={{ color: 'var(--b1-neutral-gray)' }}>
                      {policy.id}
                    </span>
                    <span
                      className="px-2 py-1 text-xs tracking-widest"
                      style={{
                        backgroundColor: policy.status === 'Active' ? 'var(--b1-gold-minimal)' : '#D4AF37',
                        color: 'var(--b1-black-marble)'
                      }}
                    >
                      {policy.status.toUpperCase()}
                    </span>
                  </div>
                  <h3 className="mb-2 tracking-wide" style={{ fontWeight: 500 }}>
                    {policy.title}
                  </h3>
                  <div className="text-xs" style={{ color: 'var(--b1-neutral-gray)' }}>
                    Version: {policy.version}
                  </div>
                </div>
              </div>
              <div className="text-xs space-y-1" style={{ color: 'var(--b1-neutral-gray)' }}>
                <div>Last Review: {policy.lastReview}</div>
                <div>Next Review: {policy.nextReview}</div>
              </div>
              <div className="mt-4 flex gap-2">
                <button className="flex-1 py-2 border text-xs tracking-wider" style={{ borderColor: 'var(--b1-border-subtle)' }}>
                  View Policy
                </button>
                <button className="flex-1 py-2 text-xs tracking-wider" style={{ backgroundColor: 'var(--b1-gold-minimal)', color: 'var(--b1-black-marble)' }}>
                  Download PDF
                </button>
              </div>
            </div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
