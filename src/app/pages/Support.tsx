import { motion } from "motion/react";
import { Mail, Phone, MessageSquare } from "lucide-react";

export function Support() {
  return (
    <div className="min-h-screen py-20 px-6" style={{ backgroundColor: 'var(--b1-obsidian)' }}>
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h1 className="mb-4 tracking-[0.2em]" style={{ fontSize: '3rem', fontWeight: 500 }}>
            SUPPORT
          </h1>
          <p className="text-lg" style={{ color: 'var(--b1-neutral-gray)' }}>
            Customer support contact information and channels
          </p>
        </motion.div>

        {/* Contact Methods */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="p-8 border text-center"
            style={{ borderColor: 'var(--b1-border-subtle)', backgroundColor: 'var(--b1-obsidian-panel)' }}
          >
            <Mail className="w-8 h-8 mx-auto mb-4" style={{ color: 'var(--b1-gold-trim)' }} />
            <h3 className="mb-2 tracking-wider" style={{ fontWeight: 500 }}>
              Email
            </h3>
            <p className="text-sm" style={{ color: 'var(--b1-neutral-gray)' }}>
              support@chiconchainfood.com
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="p-8 border text-center"
            style={{ borderColor: 'var(--b1-border-subtle)', backgroundColor: 'var(--b1-obsidian-panel)' }}
          >
            <Phone className="w-8 h-8 mx-auto mb-4" style={{ color: 'var(--b1-gold-trim)' }} />
            <h3 className="mb-2 tracking-wider" style={{ fontWeight: 500 }}>
              Phone
            </h3>
            <p className="text-sm" style={{ color: 'var(--b1-neutral-gray)' }}>
              1-800-CHIC-COC
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--b1-neutral-gray)' }}>
              Mon-Sun: 9:00 AM - 10:00 PM
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="p-8 border text-center"
            style={{ borderColor: 'var(--b1-border-subtle)', backgroundColor: 'var(--b1-obsidian-panel)' }}
          >
            <MessageSquare className="w-8 h-8 mx-auto mb-4" style={{ color: 'var(--b1-gold-trim)' }} />
            <h3 className="mb-2 tracking-wider" style={{ fontWeight: 500 }}>
              In-App
            </h3>
            <p className="text-sm" style={{ color: 'var(--b1-neutral-gray)' }}>
              Order status and notifications available in your account dashboard
            </p>
          </motion.div>
        </div>

        {/* Support Information */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="p-8 border"
          style={{ borderColor: 'var(--b1-border-subtle)', backgroundColor: 'var(--b1-obsidian-panel)' }}
        >
          <h2 className="mb-6 tracking-wider" style={{ fontSize: '1.5rem', fontWeight: 500 }}>
            Order Support
          </h2>
          <div className="space-y-4 text-sm leading-relaxed" style={{ color: 'var(--b1-neutral-gray)' }}>
            <p>
              <strong>Order Issues:</strong> For missing items, incorrect orders, or delivery concerns, contact support within 24 hours of order completion with your order number.
            </p>
            <p>
              <strong>Refunds:</strong> Refund requests are processed within 5-7 business days. All refunds are issued to the original payment method.
            </p>
            <p>
              <strong>Account Assistance:</strong> For password resets, account updates, or rewards questions, email support with your account details.
            </p>
            <p>
              <strong>Store-Specific Questions:</strong> Contact information for individual store locations is available on the Locations page.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
