import { motion } from "motion/react";
import { Shield } from "lucide-react";

export function Privacy() {
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
            <Shield className="w-12 h-12" style={{ color: 'var(--b1-gold-trim)' }} />
            <div>
              <h1 className="tracking-[0.2em]" style={{ fontSize: '3rem', fontWeight: 500 }}>
                PRIVACY POLICY
              </h1>
              <p className="text-sm tracking-wide" style={{ color: 'var(--b1-neutral-gray)' }}>
                Data Collection and Use
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
              1. Information We Collect
            </h2>
            <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--b1-neutral-gray)' }}>
              We collect information you provide directly (name, email, phone, address), information collected automatically (device data, usage data, location data), and information from third parties (payment processors, delivery partners).
            </p>
          </section>

          <section>
            <h2 className="mb-4 tracking-wider" style={{ fontSize: '1.5rem', fontWeight: 500 }}>
              2. How We Use Your Information
            </h2>
            <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--b1-neutral-gray)' }}>
              We use collected information to process orders, provide customer support, send transactional notifications, manage rewards programs, improve services, and ensure security and compliance.
            </p>
          </section>

          <section>
            <h2 className="mb-4 tracking-wider" style={{ fontSize: '1.5rem', fontWeight: 500 }}>
              3. Data Sharing
            </h2>
            <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--b1-neutral-gray)' }}>
              We do not sell your personal information. We share data only with service providers (payment processors, delivery partners), legal authorities when required by law, and within GlenKeos entities as necessary for operations.
            </p>
          </section>

          <section>
            <h2 className="mb-4 tracking-wider" style={{ fontSize: '1.5rem', fontWeight: 500 }}>
              4. Data Security
            </h2>
            <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--b1-neutral-gray)' }}>
              We implement industry-standard security measures including AES-256 encryption at rest, TLS 1.2+ encryption in transit, secure key management via AWS KMS, and role-based access controls. All payment data is tokenized and never stored directly.
            </p>
          </section>

          <section>
            <h2 className="mb-4 tracking-wider" style={{ fontSize: '1.5rem', fontWeight: 500 }}>
              5. Your Rights
            </h2>
            <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--b1-neutral-gray)' }}>
              You have the right to access your data, request corrections, request deletion (subject to legal retention requirements), opt out of marketing communications, and withdraw consent where applicable. Contact support to exercise these rights.
            </p>
          </section>

          <section>
            <h2 className="mb-4 tracking-wider" style={{ fontSize: '1.5rem', fontWeight: 500 }}>
              6. Cookies and Tracking
            </h2>
            <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--b1-neutral-gray)' }}>
              We use cookies and similar technologies for authentication, preferences, analytics, and service functionality. You can control cookie settings through your browser, though some features may not function properly if cookies are disabled.
            </p>
          </section>

          <section>
            <h2 className="mb-4 tracking-wider" style={{ fontSize: '1.5rem', fontWeight: 500 }}>
              7. Data Retention
            </h2>
            <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--b1-neutral-gray)' }}>
              We retain data for as long as necessary to provide services, comply with legal obligations, resolve disputes, and enforce agreements. Account data is retained while active plus applicable legal retention periods. Order data is retained for 7 years for compliance purposes.
            </p>
          </section>

          <section>
            <h2 className="mb-4 tracking-wider" style={{ fontSize: '1.5rem', fontWeight: 500 }}>
              8. California Privacy Rights (CCPA)
            </h2>
            <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--b1-neutral-gray)' }}>
              California residents have additional rights including the right to know what personal information is collected, the right to delete personal information, and the right to opt-out of sale (we do not sell personal information). Contact support to exercise CCPA rights.
            </p>
          </section>

          <section>
            <h2 className="mb-4 tracking-wider" style={{ fontSize: '1.5rem', fontWeight: 500 }}>
              9. Changes to This Policy
            </h2>
            <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--b1-neutral-gray)' }}>
              We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated effective date. Material changes will be communicated via email or in-app notification.
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
