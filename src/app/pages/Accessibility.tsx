import { motion } from "motion/react";
import { Eye, Keyboard, Type } from "lucide-react";

export function Accessibility() {
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
            ACCESSIBILITY
          </h1>
          <p className="text-lg" style={{ color: 'var(--b1-neutral-gray)' }}>
            Our commitment to accessible design and inclusive experiences
          </p>
        </motion.div>

        {/* Key Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="p-6 border text-center"
            style={{ borderColor: 'var(--b1-border-subtle)', backgroundColor: 'var(--b1-obsidian-panel)' }}
          >
            <Eye className="w-8 h-8 mx-auto mb-4" style={{ color: 'var(--b1-gold-trim)' }} />
            <h3 className="mb-2 tracking-wider" style={{ fontWeight: 500 }}>
              Color Contrast
            </h3>
            <p className="text-sm" style={{ color: 'var(--b1-neutral-gray)' }}>
              Minimum 4.5:1 for text, 3:1 for UI elements
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="p-6 border text-center"
            style={{ borderColor: 'var(--b1-border-subtle)', backgroundColor: 'var(--b1-obsidian-panel)' }}
          >
            <Keyboard className="w-8 h-8 mx-auto mb-4" style={{ color: 'var(--b1-gold-trim)' }} />
            <h3 className="mb-2 tracking-wider" style={{ fontWeight: 500 }}>
              Keyboard Navigation
            </h3>
            <p className="text-sm" style={{ color: 'var(--b1-neutral-gray)' }}>
              All interactive elements accessible via tab
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="p-6 border text-center"
            style={{ borderColor: 'var(--b1-border-subtle)', backgroundColor: 'var(--b1-obsidian-panel)' }}
          >
            <Type className="w-8 h-8 mx-auto mb-4" style={{ color: 'var(--b1-gold-trim)' }} />
            <h3 className="mb-2 tracking-wider" style={{ fontWeight: 500 }}>
              Text Scaling
            </h3>
            <p className="text-sm" style={{ color: 'var(--b1-neutral-gray)' }}>
              Layout stable at 200% zoom
            </p>
          </motion.div>
        </div>

        {/* Standards */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="p-8 border mb-8"
          style={{ borderColor: 'var(--b1-border-subtle)', backgroundColor: 'var(--b1-obsidian-panel)' }}
        >
          <h2 className="mb-6 tracking-wider" style={{ fontSize: '1.5rem', fontWeight: 500 }}>
            WCAG 2.1 Compliance
          </h2>
          <div className="space-y-4 text-sm leading-relaxed" style={{ color: 'var(--b1-neutral-gray)' }}>
            <p>
              Chic-on-Chain is designed to meet Web Content Accessibility Guidelines (WCAG) 2.1 Level AA standards. Our implementation includes:
            </p>
            <ul className="space-y-2 ml-6">
              <li>• Semantic HTML structure for proper screen reader interpretation</li>
              <li>• ARIA labels for all non-text elements and interactive components</li>
              <li>• Logical reading order and heading hierarchy</li>
              <li>• Visible focus states for keyboard navigation</li>
              <li>• Alternative text for all images and visual content</li>
              <li>• Form labels and error messages clearly associated with inputs</li>
              <li>• No reliance on color alone to convey information</li>
              <li>• Minimal or optional animation with no essential information conveyed through motion</li>
            </ul>
          </div>
        </motion.div>

        {/* Assistive Technology */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="p-8 border mb-8"
          style={{ borderColor: 'var(--b1-border-subtle)', backgroundColor: 'var(--b1-obsidian-panel)' }}
        >
          <h2 className="mb-6 tracking-wider" style={{ fontSize: '1.5rem', fontWeight: 500 }}>
            Assistive Technology Support
          </h2>
          <div className="space-y-4 text-sm leading-relaxed" style={{ color: 'var(--b1-neutral-gray)' }}>
            <p>
              Our website and mobile applications are tested with:
            </p>
            <ul className="space-y-2 ml-6">
              <li>• NVDA (Windows screen reader)</li>
              <li>• JAWS (Windows screen reader)</li>
              <li>• VoiceOver (macOS and iOS screen reader)</li>
              <li>• TalkBack (Android screen reader)</li>
              <li>• Keyboard-only navigation</li>
              <li>• Voice control systems</li>
            </ul>
          </div>
        </motion.div>

        {/* Feedback */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="p-8 border"
          style={{ borderColor: 'var(--b1-gold-trim)', backgroundColor: 'var(--b1-obsidian-panel)' }}
        >
          <h2 className="mb-4 tracking-wider" style={{ fontSize: '1.5rem', fontWeight: 500 }}>
            Accessibility Feedback
          </h2>
          <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--b1-neutral-gray)' }}>
            We are committed to continuous improvement of our accessibility features. If you encounter any barriers or have suggestions for improvement, please contact us:
          </p>
          <div className="text-sm" style={{ color: 'var(--b1-neutral-gray)' }}>
            Email: accessibility@chiconchainfood.com<br />
            Phone: 1-800-CHIC-COC
          </div>
        </motion.div>
      </div>
    </div>
  );
}
