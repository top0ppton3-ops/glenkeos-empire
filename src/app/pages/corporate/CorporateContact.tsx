import { motion } from "motion/react";
import { Mail, Phone, MapPin, Send } from "lucide-react";

export function CorporateContact() {
  return (
    <div className="min-h-screen py-12 px-6" style={{ backgroundColor: 'var(--b1-obsidian)' }}>
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-16 text-center"
        >
          <h1 className="mb-4 tracking-[0.2em]" style={{ fontSize: '3rem', fontWeight: 500 }}>
            CONTACT
          </h1>
          <p className="text-lg" style={{ color: 'var(--b1-neutral-gray)' }}>
            Enterprise inquiries, legal matters, and compliance questions
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {[
            { icon: Mail, label: "Legal", value: "legal@glenkeos.com" },
            { icon: Mail, label: "Compliance", value: "compliance@glenkeos.com" },
            { icon: Mail, label: "General", value: "info@glenkeos.com" }
          ].map((contact, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
              className="p-6 border text-center"
              style={{ borderColor: 'var(--b1-border-subtle)', backgroundColor: 'var(--b1-obsidian-panel)' }}
            >
              <contact.icon className="w-8 h-8 mx-auto mb-3" style={{ color: 'var(--b1-gold-trim)' }} />
              <div className="text-sm mb-2 tracking-wider" style={{ color: 'var(--b1-neutral-gray)' }}>
                {contact.label}
              </div>
              <div className="text-sm" style={{ color: 'var(--b1-white-space)' }}>
                {contact.value}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Important Notice */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mb-8 p-6 border"
          style={{ borderColor: 'var(--b1-gold-trim)', backgroundColor: 'var(--b1-obsidian-panel)' }}
        >
          <h3 className="mb-3 tracking-wider" style={{ fontWeight: 500 }}>
            Important Notice
          </h3>
          <div className="space-y-2 text-sm leading-relaxed" style={{ color: 'var(--b1-neutral-gray)' }}>
            <p>
              <strong>Do not submit confidential or privileged information</strong> through this contact form. Communication via this form is not secure and may be intercepted.
            </p>
            <p>
              <strong>No client relationship:</strong> Submission of this form does not create an attorney-client relationship, advisory relationship, business relationship, or any other professional relationship with GlenKeos or its affiliates.
            </p>
            <p>
              For sensitive legal or compliance matters, contact our legal team directly at legal@glenkeos.com using encrypted communication methods.
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="p-8 border"
          style={{ borderColor: 'var(--b1-border-subtle)', backgroundColor: 'var(--b1-obsidian-panel)' }}
        >
          <h2 className="mb-6 tracking-wider" style={{ fontSize: '1.5rem', fontWeight: 500 }}>
            Send a Message
          </h2>
          <form className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Name"
                className="px-4 py-3 border outline-none transition-colors"
                style={{
                  backgroundColor: 'var(--b1-black-marble)',
                  borderColor: 'var(--b1-border-subtle)',
                  color: 'var(--b1-white-space)'
                }}
              />
              <input
                type="email"
                placeholder="Email"
                className="px-4 py-3 border outline-none transition-colors"
                style={{
                  backgroundColor: 'var(--b1-black-marble)',
                  borderColor: 'var(--b1-border-subtle)',
                  color: 'var(--b1-white-space)'
                }}
              />
            </div>
            <input
              type="text"
              placeholder="Subject"
              className="w-full px-4 py-3 border outline-none transition-colors"
              style={{
                backgroundColor: 'var(--b1-black-marble)',
                borderColor: 'var(--b1-border-subtle)',
                color: 'var(--b1-white-space)'
              }}
            />
            <textarea
              placeholder="Message"
              rows={6}
              className="w-full px-4 py-3 border outline-none transition-colors resize-none"
              style={{
                backgroundColor: 'var(--b1-black-marble)',
                borderColor: 'var(--b1-border-subtle)',
                color: 'var(--b1-white-space)'
              }}
            />
            <button
              type="submit"
              className="px-8 py-3 tracking-wider flex items-center gap-2 transition-all"
              style={{ backgroundColor: 'var(--b1-gold-minimal)', color: 'var(--b1-black-marble)', fontWeight: 500 }}
            >
              <Send className="w-4 h-4" />
              Send Message
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
