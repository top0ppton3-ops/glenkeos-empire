import { motion } from "motion/react";
import { Building2, Shield, TrendingUp, Users } from "lucide-react";

export function About() {
  const values = [
    {
      icon: Shield,
      title: "Consistent Quality",
      description: "Every location operates under the same preparation standards and ingredient specifications."
    },
    {
      icon: TrendingUp,
      title: "Operational Clarity",
      description: "Structured processes ensure reliable service across all touchpoints: in-store, online, and delivery."
    },
    {
      icon: Users,
      title: "Customer Experience",
      description: "Simple, accurate ordering with transparent information at every step."
    },
    {
      icon: Building2,
      title: "Enterprise Stability",
      description: "Built within GlenKeos infrastructure for long-term reliability and compliance."
    }
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--b1-obsidian)' }}>
      {/* Hero */}
      <section className="py-20 px-6" style={{ backgroundColor: 'var(--b1-black-marble)' }}>
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="mb-6 tracking-[0.2em]" style={{ fontSize: '3.5rem', fontWeight: 500 }}>
              WHO WE ARE
            </h1>
            <p className="text-xl leading-relaxed" style={{ color: 'var(--b1-neutral-gray)' }}>
              Chic-on-Chain is built on a simple idea: deliver consistent quality at every touchpoint.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <p className="text-lg leading-relaxed mb-6" style={{ color: 'var(--b1-neutral-gray)' }}>
              The brand operates within a structured enterprise ecosystem that prioritizes clarity, stability, and customer experience.
            </p>
            <p className="text-lg leading-relaxed mb-6" style={{ color: 'var(--b1-neutral-gray)' }}>
              No mythology. No fictional narratives. Just a clean, modern food operation built for reliability.
            </p>
            <p className="text-lg leading-relaxed" style={{ color: 'var(--b1-neutral-gray)' }}>
              Every menu item follows controlled preparation standards. Every location adheres to the same operational protocols. Every order is backed by enterprise-grade compliance and food safety systems.
            </p>
          </motion.div>

          {/* Values Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="p-8 border"
                style={{ borderColor: 'var(--b1-border-subtle)', backgroundColor: 'var(--b1-obsidian-panel)' }}
              >
                <div className="w-12 h-12 border mb-4 flex items-center justify-center" style={{ borderColor: 'var(--b1-gold-trim)' }}>
                  <value.icon className="w-6 h-6" style={{ color: 'var(--b1-gold-trim)' }} />
                </div>
                <h3 className="mb-3 tracking-wider" style={{ fontSize: '1.25rem', fontWeight: 500 }}>
                  {value.title}
                </h3>
                <p className="leading-relaxed" style={{ color: 'var(--b1-neutral-gray)' }}>
                  {value.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Governance Context */}
      <section className="py-20 px-6" style={{ backgroundColor: 'var(--b1-black-marble)' }}>
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="mb-6 tracking-[0.15em]" style={{ fontSize: '2rem', fontWeight: 500 }}>
              Part of GlenKeos Enterprise
            </h2>
            <p className="text-lg leading-relaxed mb-8" style={{ color: 'var(--b1-neutral-gray)' }}>
              Chic-on-Chain operates within the GlenKeos enterprise infrastructure, a multi-entity system designed for compliance, operational clarity, and long-term stability.
            </p>
            <a
              href="/corporate"
              className="inline-block px-10 py-3 border tracking-wider transition-all"
              style={{ borderColor: 'var(--b1-gold-trim)', color: 'var(--b1-gold-trim)' }}
            >
              LEARN MORE ABOUT GLENKEOS
            </a>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
