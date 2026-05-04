import { motion } from "motion/react";
import { Shield, Scale, FileCheck, Lock, AlertTriangle, CheckCircle2 } from "lucide-react";

export function Compliance() {
  const complianceAreas = [
    {
      icon: Scale,
      title: "Entity Shielding",
      description: "Zero commingling of funds, data, or operations across all divisions. Each entity maintains separate bank accounts, data systems, and operational controls.",
      status: "100% Compliant"
    },
    {
      icon: FileCheck,
      title: "Immutable Audit Trails",
      description: "Every transaction, data access, and operational change is logged permanently with blockchain-level integrity. No deletion, no modification.",
      status: "Active"
    },
    {
      icon: Lock,
      title: "Role-Based Access Control",
      description: "Multi-factor authentication, zero-trust architecture, and need-to-know access enforcement across all systems and documents.",
      status: "Active"
    },
    {
      icon: Shield,
      title: "Federal-Ready Documentation",
      description: "SOPs, compliance manuals, incident response plans, and legal agreements maintained to federal regulatory standards.",
      status: "Current"
    }
  ];

  const recentAudits = [
    { date: "2026-04-01", area: "Financial Separation", result: "Pass", auditor: "COC Command" },
    { date: "2026-03-15", area: "Data Security", result: "Pass", auditor: "COC Command" },
    { date: "2026-03-01", area: "Food Safety Compliance", result: "Pass", auditor: "External" },
    { date: "2026-02-15", area: "Employee Documentation", result: "Pass", auditor: "COC Command" }
  ];

  return (
    <div className="min-h-screen py-12 px-6" style={{ backgroundColor: 'var(--b1-black-marble)' }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-16"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 border flex items-center justify-center" style={{ borderColor: 'var(--b1-gold-trim)' }}>
              <Shield className="w-8 h-8" style={{ color: 'var(--b1-gold-trim)' }} />
            </div>
            <div>
              <h1 className="tracking-[0.2em] mb-2" style={{ fontSize: '3rem', fontWeight: 500 }}>
                COMPLIANCE & COC COMMAND
              </h1>
              <p className="text-lg tracking-wide" style={{ color: 'var(--b3-gold-micro)' }}>
                Internal Regulatory Authority
              </p>
            </div>
          </div>
          <p className="text-lg leading-relaxed max-w-3xl" style={{ color: 'var(--b1-neutral-gray)' }}>
            COC Command operates within the GRC division as an independent internal regulator ensuring all entities maintain federal-ready compliance, zero commingling, and enterprise-grade controls.
          </p>
        </motion.div>

        {/* Compliance Areas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {complianceAreas.map((area, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="p-8 border"
              style={{ borderColor: 'var(--b1-border-subtle)', backgroundColor: 'var(--b1-obsidian-panel)' }}
            >
              <div className="flex items-start justify-between mb-4">
                <area.icon className="w-10 h-10" style={{ color: 'var(--b1-gold-trim)' }} />
                <div className="px-3 py-1 text-xs tracking-widest" style={{ backgroundColor: 'var(--b1-gold-minimal)', color: 'var(--b1-black-marble)' }}>
                  {area.status}
                </div>
              </div>
              <h3 className="mb-3 tracking-wider" style={{ fontSize: '1.25rem', fontWeight: 500 }}>
                {area.title}
              </h3>
              <p className="leading-relaxed" style={{ color: 'var(--b1-neutral-gray)' }}>
                {area.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Recent Audits */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="mb-8 tracking-[0.15em]" style={{ fontSize: '2rem', fontWeight: 500 }}>
            Recent Audit Activity
          </h2>
          <div className="space-y-4">
            {recentAudits.map((audit, index) => (
              <div
                key={index}
                className="p-6 border flex items-center justify-between"
                style={{ borderColor: 'var(--b1-border-subtle)', backgroundColor: 'var(--b1-obsidian-panel)' }}
              >
                <div className="flex items-center gap-6">
                  <CheckCircle2 className="w-6 h-6" style={{ color: 'var(--b1-gold-minimal)' }} />
                  <div>
                    <h4 className="mb-1 tracking-wide" style={{ fontWeight: 500 }}>
                      {audit.area}
                    </h4>
                    <div className="text-sm" style={{ color: 'var(--b1-neutral-gray)' }}>
                      {audit.date} • Audited by {audit.auditor}
                    </div>
                  </div>
                </div>
                <div className="px-4 py-2 text-sm tracking-widest" style={{ backgroundColor: 'var(--b1-gold-minimal)', color: 'var(--b1-black-marble)' }}>
                  {audit.result}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Legal Disclaimer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mt-16 p-8 border"
          style={{ borderColor: 'var(--b1-gold-trim)', backgroundColor: 'var(--b1-obsidian-panel)' }}
        >
          <div className="flex items-start gap-4">
            <AlertTriangle className="w-6 h-6 flex-shrink-0" style={{ color: 'var(--b1-gold-trim)' }} />
            <div>
              <h3 className="mb-4 tracking-wider" style={{ fontWeight: 500, fontSize: '1.25rem' }}>
                Important Disclaimers
              </h3>
              <div className="space-y-3 text-sm leading-relaxed" style={{ color: 'var(--b1-neutral-gray)' }}>
                <p>
                  <strong>Internal Governance Structure:</strong> COC Command operates within the GRC (Governance, Risk, Compliance) division of GlenKeos Holdings. It is not a separate legal entity or independent regulatory body.
                </p>
                <p>
                  <strong>Informational Purposes Only:</strong> The content provided on this page is for informational purposes only and does not constitute legal, financial, or professional advice. GlenKeos and its affiliates are not law firms and do not provide legal services.
                </p>
                <p>
                  <strong>No Attorney-Client Relationship:</strong> Accessing this information does not create an attorney-client relationship, advisory relationship, or any other professional relationship between you and GlenKeos or any of its entities.
                </p>
                <p>
                  <strong>Consult Professionals:</strong> For legal, financial, or compliance advice specific to your situation, consult qualified licensed professionals in the relevant jurisdiction.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
