import { motion } from "motion/react";
import { Link } from "react-router";
import { Shield, Building2, Scale, Lock, Database, TrendingUp, CheckCircle2, FileText } from "lucide-react";

export function GlenKeosOverview() {
  const metrics = [
    { label: "Years Operating", value: "2+", icon: TrendingUp },
    { label: "Divisions Managed", value: "3", icon: Building2 },
    { label: "Compliance Focus", value: "100%", icon: Shield },
    { label: "Uptime", value: "99.9%", icon: CheckCircle2 }
  ];

  const divisions = [
    {
      name: "GRC",
      description: "Governance, Risk, Compliance division with COC Command and GRC Engine",
      status: "Active"
    },
    {
      name: "Chic on Chain",
      description: "Premium dining operations with Rusty Link internal logistics",
      status: "Active"
    },
    {
      name: "Ghetto Eats",
      description: "Delivery infrastructure platform",
      status: "Active"
    }
  ];

  const coreCapabilities = [
    {
      icon: Shield,
      title: "Federal-Ready Compliance",
      description: "COC Command ensures all entities operate within regulatory frameworks with immutable audit trails"
    },
    {
      icon: Scale,
      title: "Entity Shielding",
      description: "Zero commingling of funds, data, or operations across divisions ensures legal separation"
    },
    {
      icon: Lock,
      title: "Zero-Trust Security",
      description: "Role-based access, encryption, multi-factor authentication across all systems"
    },
    {
      icon: Database,
      title: "Immutable Audit Trail",
      description: "Every transaction, access, and change is logged permanently with blockchain-level integrity"
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero - B3 Ultra-Modern */}
      <section className="relative py-32 px-6 overflow-hidden" style={{ backgroundColor: 'var(--b3-pure-black)' }}>
        {/* B3 Glass Effect Background */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full" style={{ background: `radial-gradient(circle, var(--b3-gold-micro), transparent)` }}></div>
        </div>

        <div className="max-w-5xl mx-auto relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="mb-8 flex justify-center"
          >
            {/* B2 Subtle Accent - Omega Sigil */}
            <div className="w-24 h-24 border flex items-center justify-center" style={{ borderColor: 'var(--b1-gold-trim)' }}>
              <div className="text-5xl" style={{ color: 'var(--b1-gold-minimal)', fontWeight: 300 }}>
                Ω
              </div>
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-6 tracking-[0.2em]"
            style={{ fontSize: '3.5rem', fontWeight: 500, color: 'var(--b1-white-space)' }}
          >
            GLENKEOS
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl mb-4 tracking-wide"
            style={{ color: 'var(--b3-gold-micro)' }}
          >
            Enterprise Infrastructure for Multi-Entity Operations
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-lg mb-12 max-w-3xl mx-auto leading-relaxed"
            style={{ color: 'var(--b1-neutral-gray)' }}
          >
            A federal-ready infrastructure managing multiple business entities with zero commingling, immutable audit trails, and enterprise-grade compliance controls.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link
              to="/corporate/divisions"
              className="px-10 py-3 tracking-wider transition-all"
              style={{ backgroundColor: 'var(--b1-gold-minimal)', color: 'var(--b1-black-marble)', fontWeight: 500 }}
            >
              View Divisions
            </Link>
            <Link
              to="/corporate/vault"
              className="px-10 py-3 border tracking-wider transition-all hover:bg-b3-glass-white"
              style={{ borderColor: 'var(--b1-gold-trim)', color: 'var(--b1-gold-trim)' }}
            >
              Governance Vault
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Metrics - B1 Corporate Luxury */}
      <section className="py-20 px-6" style={{ backgroundColor: 'var(--b1-obsidian)' }}>
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {metrics.map((metric, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center p-8 border"
                style={{ borderColor: 'var(--b1-border-subtle)', backgroundColor: 'var(--b1-obsidian-panel)' }}
              >
                <metric.icon className="w-10 h-10 mx-auto mb-4" style={{ color: 'var(--b1-gold-trim)' }} />
                <div className="text-4xl mb-2" style={{ fontWeight: 300, color: 'var(--b1-white-space)' }}>
                  {metric.value}
                </div>
                <div className="text-sm tracking-wider" style={{ color: 'var(--b1-neutral-gray)' }}>
                  {metric.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Capabilities - B1 + B3 Hybrid */}
      <section className="py-24 px-6" style={{ backgroundColor: 'var(--b1-black-marble)' }}>
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="mb-4 tracking-[0.15em]" style={{ fontSize: '2.5rem', fontWeight: 500 }}>
              Core Capabilities
            </h2>
            <p className="text-lg" style={{ color: 'var(--b1-neutral-gray)' }}>
              Enterprise-grade infrastructure built for compliance and scale
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {coreCapabilities.map((capability, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="p-8 border backdrop-blur-sm"
                style={{
                  backgroundColor: 'var(--b3-glass-white)',
                  borderColor: 'var(--b3-glass-border)'
                }}
              >
                <capability.icon className="w-12 h-12 mb-4" style={{ color: 'var(--b1-gold-trim)' }} />
                <h3 className="mb-3 tracking-wider" style={{ fontSize: '1.25rem', fontWeight: 500 }}>
                  {capability.title}
                </h3>
                <p className="leading-relaxed" style={{ color: 'var(--b1-neutral-gray)' }}>
                  {capability.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Divisions Overview - B1 */}
      <section className="py-24 px-6" style={{ backgroundColor: 'var(--b1-obsidian)' }}>
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center justify-between mb-12"
          >
            <h2 className="tracking-[0.15em]" style={{ fontSize: '2.5rem', fontWeight: 500 }}>
              Operating Divisions
            </h2>
            <Link
              to="/corporate/divisions"
              className="text-sm tracking-wider hover:underline"
              style={{ color: 'var(--b1-gold-trim)' }}
            >
              View All →
            </Link>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {divisions.map((division, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                className="p-6 border"
                style={{ borderColor: 'var(--b1-border-subtle)', backgroundColor: 'var(--b1-obsidian-panel)' }}
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="tracking-wider" style={{ fontWeight: 500 }}>
                    {division.name}
                  </h3>
                  <div className="px-2 py-1 text-xs tracking-widest" style={{ backgroundColor: 'var(--b1-gold-minimal)', color: 'var(--b1-black-marble)' }}>
                    {division.status}
                  </div>
                </div>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--b1-neutral-gray)' }}>
                  {division.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA - B3 */}
      <section className="py-24 px-6" style={{ backgroundColor: 'var(--b3-pure-black)' }}>
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <FileText className="w-16 h-16 mx-auto mb-6" style={{ color: 'var(--b1-gold-trim)' }} />
            <h2 className="mb-6 tracking-[0.15em]" style={{ fontSize: '2.5rem', fontWeight: 500 }}>
              Access Governance Documentation
            </h2>
            <p className="text-lg mb-8 leading-relaxed" style={{ color: 'var(--b1-neutral-gray)' }}>
              SOPs, compliance manuals, employee handbooks, and intercompany agreements available in the secure vault.
            </p>
            <Link
              to="/corporate/vault"
              className="inline-block px-12 py-4 border tracking-wider transition-all hover:bg-b3-glass-white"
              style={{ borderColor: 'var(--b1-gold-trim)', color: 'var(--b1-gold-trim)', fontWeight: 500 }}
            >
              ENTER GOVERNANCE VAULT
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
