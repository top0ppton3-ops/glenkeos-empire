import { motion } from "motion/react";
import { FileText } from "lucide-react";

export function Legal() {
  return (
    <div className="min-h-screen py-20 px-6" style={{ backgroundColor: 'var(--b1-obsidian)' }}>
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-16"
        >
          <div className="flex items-center gap-4 mb-6">
            <FileText className="w-12 h-12" style={{ color: 'var(--b1-gold-trim)' }} />
            <div>
              <h1 className="tracking-[0.2em]" style={{ fontSize: '3rem', fontWeight: 500 }}>
                LEGAL
              </h1>
              <p className="text-sm tracking-wide" style={{ color: 'var(--b1-neutral-gray)' }}>
                Terms of Service
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="space-y-8"
        >
          <section>
            <h2 className="mb-4 tracking-wider" style={{ fontSize: '1.5rem', fontWeight: 500 }}>
              1. Agreement to Terms
            </h2>
            <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--b1-neutral-gray)' }}>
              By accessing or using the Chic-on-Chain website, mobile application, or services, you agree to be bound by these Terms of Service. If you do not agree to these terms, do not use our services.
            </p>
          </section>

          <section>
            <h2 className="mb-4 tracking-wider" style={{ fontSize: '1.5rem', fontWeight: 500 }}>
              2. Service Description
            </h2>
            <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--b1-neutral-gray)' }}>
              Chic-on-Chain provides food ordering and delivery services. Services may vary by location. We reserve the right to modify, suspend, or discontinue any aspect of the service at any time.
            </p>
          </section>

          <section>
            <h2 className="mb-4 tracking-wider" style={{ fontSize: '1.5rem', fontWeight: 500 }}>
              3. Account Requirements
            </h2>
            <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--b1-neutral-gray)' }}>
              You must provide accurate, current, and complete information during registration. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.
            </p>
          </section>

          <section>
            <h2 className="mb-4 tracking-wider" style={{ fontSize: '1.5rem', fontWeight: 500 }}>
              4. Orders and Payment
            </h2>
            <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--b1-neutral-gray)' }}>
              All orders are subject to acceptance and availability. Prices are listed in USD and may change without notice. Payment is required at the time of order. We accept major credit cards and approved payment methods.
            </p>
          </section>

          <section>
            <h2 className="mb-4 tracking-wider" style={{ fontSize: '1.5rem', fontWeight: 500 }}>
              5. Refunds and Cancellations
            </h2>
            <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--b1-neutral-gray)' }}>
              Refund eligibility is determined on a case-by-case basis. Orders cannot be cancelled once preparation has begun. Contact support within 24 hours of order completion for refund requests.
            </p>
          </section>

          <section>
            <h2 className="mb-4 tracking-wider" style={{ fontSize: '1.5rem', fontWeight: 500 }}>
              6. Limitation of Liability
            </h2>
            <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--b1-neutral-gray)' }}>
              Chic-on-Chain and GlenKeos Holdings are not liable for any indirect, incidental, special, or consequential damages arising from use of our services. Total liability is limited to the amount paid for the applicable order.
            </p>
          </section>

          <section>
            <h2 className="mb-4 tracking-wider" style={{ fontSize: '1.5rem', fontWeight: 500 }}>
              7. Governing Law
            </h2>
            <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--b1-neutral-gray)' }}>
              These terms are governed by the laws of the State of California. Any disputes shall be resolved in the state or federal courts located in Los Angeles County, California.
            </p>
          </section>

          <section>
            <h2 className="mb-4 tracking-wider" style={{ fontSize: '1.5rem', fontWeight: 500 }}>
              8. Changes to Terms
            </h2>
            <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--b1-neutral-gray)' }}>
              We reserve the right to modify these terms at any time. Changes will be posted on this page with an updated effective date. Continued use of services after changes constitutes acceptance of modified terms.
            </p>
          </section>

          <div className="pt-8 border-t text-xs" style={{ borderTopColor: 'var(--b1-border-subtle)', color: 'var(--b1-neutral-gray)' }}>
            Last updated: April 14, 2026
          </div>
        </motion.div>
      </div>
    </div>
  );
}
