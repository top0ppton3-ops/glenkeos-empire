import { motion } from "motion/react";
import { Shield, Lock, CreditCard, FileCheck } from "lucide-react";

export function TrustRow() {
  const trustItems = [
    {
      icon: Shield,
      label: "Food Safety",
      detail: "ServSafe Certified"
    },
    {
      icon: Lock,
      label: "Data Privacy",
      detail: "CCPA Compliant"
    },
    {
      icon: CreditCard,
      label: "Secure Payments",
      detail: "PCI DSS Level 1"
    },
    {
      icon: FileCheck,
      label: "COC Verified",
      detail: "Compliance Assured"
    }
  ];

  return (
    <section className="py-12 px-6 border-y" style={{ borderColor: 'var(--b1-border-subtle)', backgroundColor: 'var(--b1-obsidian-panel)' }}>
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {trustItems.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="flex flex-col items-center text-center"
            >
              <div className="w-12 h-12 mb-3 flex items-center justify-center border" style={{ borderColor: 'var(--b1-gold-trim)' }}>
                <item.icon className="w-6 h-6" style={{ color: 'var(--b1-gold-trim)' }} />
              </div>
              <div className="tracking-wider mb-1" style={{ fontWeight: 500, fontSize: '0.9rem' }}>
                {item.label}
              </div>
              <div className="text-sm" style={{ color: 'var(--b1-neutral-gray)' }}>
                {item.detail}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
