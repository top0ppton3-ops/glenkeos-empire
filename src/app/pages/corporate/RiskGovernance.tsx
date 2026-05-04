import { motion } from "motion/react";
import { Scale, AlertTriangle, Shield, TrendingUp } from "lucide-react";

export function RiskGovernance() {
  const riskCategories = [
    { category: "Operational", level: "Low", trend: "Stable" },
    { category: "Financial", level: "Low", trend: "Improving" },
    { category: "Legal", level: "Low", trend: "Stable" },
    { category: "Reputational", level: "Low", trend: "Stable" },
    { category: "Technology", level: "Medium", trend: "Improving" },
    { category: "Compliance", level: "Low", trend: "Stable" }
  ];

  return (
    <div className="min-h-screen py-12 px-6" style={{ backgroundColor: 'var(--b1-obsidian)' }}>
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-16"
        >
          <div className="flex items-center gap-4 mb-6">
            <Scale className="w-12 h-12" style={{ color: 'var(--b1-gold-trim)' }} />
            <h1 className="tracking-[0.2em]" style={{ fontSize: '3rem', fontWeight: 500 }}>
              RISK & GOVERNANCE
            </h1>
          </div>
          <p className="text-lg leading-relaxed max-w-3xl" style={{ color: 'var(--b1-neutral-gray)' }}>
            Enterprise risk framework aligned with ISO 31000 and NIST Cybersecurity Framework (CSF). Quarterly reviews, board-style oversight, and systematic monitoring across all operational areas.
          </p>
        </motion.div>

        {/* Risk Framework Standards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-16 p-8 border"
          style={{ borderColor: 'var(--b1-gold-trim)', backgroundColor: 'var(--b1-obsidian-panel)' }}
        >
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-8 h-8" style={{ color: 'var(--b1-gold-trim)' }} />
            <h2 className="tracking-wider" style={{ fontSize: '1.5rem', fontWeight: 500 }}>
              Risk Management Standards
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <div className="mb-2 px-3 py-1 inline-block text-sm tracking-widest" style={{ backgroundColor: 'var(--b1-gold-minimal)', color: 'var(--b1-black-marble)', fontWeight: 500 }}>
                ISO 31000
              </div>
              <h4 className="mb-3 tracking-wide" style={{ fontWeight: 500, fontSize: '1.1rem' }}>
                Risk Management Guidelines
              </h4>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--b1-neutral-gray)' }}>
                GlenKeos follows ISO 31000:2018 principles for enterprise risk management, including risk identification, assessment, treatment, and monitoring. The framework provides a systematic approach to managing uncertainty and creating value across all divisions.
              </p>
            </div>

            <div>
              <div className="mb-2 px-3 py-1 inline-block text-sm tracking-widest" style={{ backgroundColor: 'var(--b1-gold-minimal)', color: 'var(--b1-black-marble)', fontWeight: 500 }}>
                NIST CSF
              </div>
              <h4 className="mb-3 tracking-wide" style={{ fontWeight: 500, fontSize: '1.1rem' }}>
                Cybersecurity Framework
              </h4>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--b1-neutral-gray)' }}>
                The NIST Cybersecurity Framework guides our technology risk posture with five core functions: Identify, Protect, Detect, Respond, Recover. All technology systems align with NIST CSF controls and undergo regular assessment.
              </p>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t text-sm leading-relaxed" style={{ borderTopColor: 'var(--b1-border-subtle)', color: 'var(--b1-neutral-gray)' }}>
            <strong>Application:</strong> These frameworks inform but do not constitute GlenKeos policy. Actual risk management practices are tailored to operational needs and regulatory requirements specific to the food service and delivery industries.
          </div>
        </motion.div>

        {/* Risk Categories */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <h2 className="mb-6 tracking-wider" style={{ fontSize: '1.5rem', fontWeight: 500 }}>
            Current Risk Assessment
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {riskCategories.map((risk, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.05 }}
                className="p-6 border"
                style={{ borderColor: 'var(--b1-border-subtle)', backgroundColor: 'var(--b1-obsidian-panel)' }}
              >
                <h3 className="mb-4 tracking-wider" style={{ fontWeight: 500 }}>
                  {risk.category}
                </h3>
                <div className="flex items-center justify-between text-sm">
                  <span style={{ color: 'var(--b1-neutral-gray)' }}>Risk Level:</span>
                  <span style={{ color: risk.level === "Low" ? 'var(--b1-gold-minimal)' : 'var(--b1-neutral-gray)' }}>
                    {risk.level}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm mt-2">
                  <span style={{ color: 'var(--b1-neutral-gray)' }}>Trend:</span>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" style={{ color: risk.trend === "Improving" ? 'var(--b1-gold-minimal)' : 'var(--b1-neutral-gray)' }} />
                    <span>{risk.trend}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
