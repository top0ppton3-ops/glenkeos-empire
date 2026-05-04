import { motion } from "motion/react";
import { Link } from "react-router";
import { Building2, ExternalLink, CheckCircle2, TrendingUp } from "lucide-react";

export function Divisions() {
  const parent = {
    name: "GlenKeos Holdings",
    tagline: "Enterprise Holding Structure",
    description: "Parent holding entity managing strategic oversight, capital allocation, and governance frameworks across all operating divisions.",
    status: "Active",
    entities: 1,
    launched: "2024"
  };

  const divisions = [
    {
      name: "GRC",
      tagline: "Governance, Risk, Compliance Division",
      description: "Enterprise governance division ensuring federal-ready compliance, zero commingling, and enterprise-grade controls across all entities. Houses COC Command (internal regulatory authority) and GRC Engine (compliance/risk system).",
      status: "Active",
      entities: 1,
      launched: "2024",
      url: "/corporate/compliance",
      internalUnits: [
        {
          name: "COC Command",
          role: "Internal Regulatory Authority",
          description: "Independent internal regulator ensuring compliance, audit trails, and operational standards"
        },
        {
          name: "GRC Engine",
          role: "Compliance & Risk System",
          description: "Automated compliance monitoring, risk assessment, and audit trail management"
        }
      ]
    },
    {
      name: "Chic on Chain",
      tagline: "Premium Dining Operations",
      description: "Customer-facing restaurant operations delivering premium fast-casual chicken. Houses Rusty Link (internal operations and logistics unit).",
      status: "Active",
      entities: 1,
      launched: "2024",
      url: "/",
      internalUnits: [
        {
          name: "Rusty Link",
          role: "Internal Ops & Logistics",
          description: "Kitchen operations, routing, inventory management, operational backbone"
        }
      ]
    },
    {
      name: "Ghetto Eats",
      tagline: "Delivery Infrastructure Platform",
      description: "Delivery channel powered by Chic on Chain services and Rusty Link logistics, governed by GRC and COC Command compliance standards.",
      status: "Active",
      entities: 1,
      launched: "2025"
    }
  ];

  return (
    <div className="min-h-screen py-12 px-6" style={{ backgroundColor: 'var(--b1-obsidian)' }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-16"
        >
          <div className="flex items-center gap-4 mb-6">
            <Building2 className="w-12 h-12" style={{ color: 'var(--b1-gold-trim)' }} />
            <h1 className="tracking-[0.2em]" style={{ fontSize: '3rem', fontWeight: 500 }}>
              DIVISIONS & SERIES
            </h1>
          </div>
          <p className="text-lg leading-relaxed max-w-3xl" style={{ color: 'var(--b1-neutral-gray)' }}>
            GlenKeos Holdings parent structure with three operating divisions: GRC (governance/compliance), Chic on Chain (restaurant operations), and Ghetto Eats (delivery). Zero commingling between entities.
          </p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-8 mb-16">
          {[
            { label: "Total Divisions", value: "3" },
            { label: "Active Operations", value: "3" },
            { label: "Compliance Rate", value: "100%" }
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
              className="p-6 border text-center"
              style={{ borderColor: 'var(--b1-border-subtle)', backgroundColor: 'var(--b1-obsidian-panel)' }}
            >
              <div className="text-3xl mb-2" style={{ fontWeight: 300, color: 'var(--b1-gold-minimal)' }}>
                {stat.value}
              </div>
              <div className="text-sm tracking-wider" style={{ color: 'var(--b1-neutral-gray)' }}>
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Parent Entity */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="p-8 border mb-12"
          style={{ borderColor: 'var(--b1-gold-trim)', backgroundColor: 'var(--b1-obsidian-panel)' }}
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h2 className="tracking-wider" style={{ fontSize: '1.75rem', fontWeight: 500, color: 'var(--b1-gold-minimal)' }}>
                  {parent.name}
                </h2>
              </div>
              <p className="text-lg mb-4" style={{ color: 'var(--b3-gold-micro)' }}>
                {parent.tagline}
              </p>
            </div>
            <div className="px-3 py-1 text-xs tracking-widest flex items-center gap-2" style={{ backgroundColor: 'var(--b1-gold-minimal)', color: 'var(--b1-black-marble)' }}>
              <CheckCircle2 className="w-3 h-3" />
              {parent.status}
            </div>
          </div>

          <p className="mb-6 leading-relaxed" style={{ color: 'var(--b1-neutral-gray)' }}>
            {parent.description}
          </p>

          <div className="flex items-center gap-8 text-sm" style={{ color: 'var(--b1-neutral-gray)' }}>
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              <span>Parent Holding</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              <span>Launched {parent.launched}</span>
            </div>
          </div>
        </motion.div>

        {/* Divisions Grid */}
        <div className="grid grid-cols-1 gap-6">
          {divisions.map((division, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}
              className="p-8 border hover:border-b1-gold-trim transition-all group"
              style={{ borderColor: 'var(--b1-border-subtle)', backgroundColor: 'var(--b1-obsidian-panel)' }}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="tracking-wider group-hover:text-b1-gold-trim transition-colors" style={{ fontSize: '1.75rem', fontWeight: 500 }}>
                      {division.name}
                    </h2>
                    {division.url && (
                      <Link to={division.url} className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <ExternalLink className="w-5 h-5" style={{ color: 'var(--b1-gold-trim)' }} />
                      </Link>
                    )}
                  </div>
                  <p className="text-lg mb-4" style={{ color: 'var(--b3-gold-micro)' }}>
                    {division.tagline}
                  </p>
                </div>
                <div className="px-3 py-1 text-xs tracking-widest flex items-center gap-2" style={{ backgroundColor: 'var(--b1-gold-minimal)', color: 'var(--b1-black-marble)' }}>
                  <CheckCircle2 className="w-3 h-3" />
                  {division.status}
                </div>
              </div>

              <p className="mb-6 leading-relaxed" style={{ color: 'var(--b1-neutral-gray)' }}>
                {division.description}
              </p>

              {/* Internal Units */}
              {division.internalUnits && (
                <div className="mb-6 p-4 border-l-2 ml-4" style={{ borderLeftColor: 'var(--b1-gold-trim)' }}>
                  <div className="text-xs tracking-widest mb-3" style={{ color: 'var(--b3-gold-micro)' }}>
                    INTERNAL UNITS
                  </div>
                  <div className="space-y-3">
                    {division.internalUnits.map((unit, unitIndex) => (
                      <div key={unitIndex} className="pl-4">
                        <div className="text-sm mb-1" style={{ fontWeight: 500 }}>
                          {unit.name} <span style={{ color: 'var(--b1-neutral-gray)', fontWeight: 400 }}>— {unit.role}</span>
                        </div>
                        <div className="text-xs leading-relaxed" style={{ color: 'var(--b1-neutral-gray)' }}>
                          {unit.description}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-8 text-sm" style={{ color: 'var(--b1-neutral-gray)' }}>
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  <span>{division.entities} Division</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  <span>Launched {division.launched}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
