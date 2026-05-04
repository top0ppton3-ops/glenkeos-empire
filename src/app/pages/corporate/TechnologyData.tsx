import { motion } from "motion/react";
import { Database, Lock, Shield, Server, Key, FileText } from "lucide-react";

export function TechnologyData() {
  const techCapabilities = [
    {
      icon: Lock,
      title: "Zero-Trust Architecture",
      description: "Multi-factor authentication, role-based access control (RBAC), and continuous verification across all systems. No implicit trust, every request authenticated."
    },
    {
      icon: Database,
      title: "Encrypted Data Storage",
      description: "AES-256 encryption at rest with AWS KMS-managed keys. Automatic key rotation. TLS 1.2+ for all data in transit. Hardware security modules (HSM) for key storage."
    },
    {
      icon: Shield,
      title: "Immutable Audit Logs",
      description: "Blockchain-level integrity for all transactions, access events, and system changes. Write-once, read-many (WORM) storage with cryptographic verification."
    },
    {
      icon: Server,
      title: "99.9% Uptime SLA",
      description: "Redundant infrastructure across multiple AWS availability zones, automated failover, and 24/7 monitoring with real-time alerting."
    }
  ];

  const encryptionStandards = [
    {
      category: "Data at Rest",
      standard: "AES-256-GCM",
      details: "AWS KMS-managed encryption keys with automatic rotation every 90 days. Customer master keys (CMK) stored in FIPS 140-2 Level 3 HSMs."
    },
    {
      category: "Data in Transit",
      standard: "TLS 1.2 / TLS 1.3",
      details: "Perfect forward secrecy (PFS) enabled. Certificate pinning for critical services. HSTS enforced across all domains."
    },
    {
      category: "Key Management",
      standard: "AWS KMS",
      details: "Centralized key management with access logging. Separation of duties enforced. Key usage audited in real-time."
    },
    {
      category: "Database Encryption",
      standard: "Transparent Data Encryption (TDE)",
      details: "RDS encrypted instances with KMS integration. Automated backups encrypted with same key hierarchy. Point-in-time recovery maintained."
    }
  ];

  return (
    <div className="min-h-screen py-12 px-6" style={{ backgroundColor: 'var(--b3-pure-black)' }}>
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-16"
        >
          <div className="flex items-center gap-4 mb-6">
            <Database className="w-12 h-12" style={{ color: 'var(--b1-gold-trim)' }} />
            <h1 className="tracking-[0.2em]" style={{ fontSize: '3rem', fontWeight: 500 }}>
              TECHNOLOGY & DATA
            </h1>
          </div>
          <p className="text-lg leading-relaxed max-w-3xl" style={{ color: 'var(--b1-neutral-gray)' }}>
            Enterprise-grade infrastructure with zero-trust security, encrypted storage, and immutable audit trails.
          </p>
        </motion.div>

        {/* Core Capabilities */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {techCapabilities.map((capability, index) => (
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

        {/* Encryption Standards */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="flex items-center gap-3 mb-8">
            <Key className="w-8 h-8" style={{ color: 'var(--b1-gold-trim)' }} />
            <h2 className="tracking-[0.15em]" style={{ fontSize: '2rem', fontWeight: 500 }}>
              Encryption Standards
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {encryptionStandards.map((standard, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="p-6 border backdrop-blur-sm"
                style={{
                  backgroundColor: 'var(--b3-glass-white)',
                  borderColor: 'var(--b3-glass-border)'
                }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="tracking-wider mb-1" style={{ fontWeight: 500, fontSize: '1.1rem' }}>
                      {standard.category}
                    </h4>
                    <div className="px-3 py-1 inline-block text-xs tracking-widest" style={{ backgroundColor: 'var(--b1-gold-minimal)', color: 'var(--b1-black-marble)' }}>
                      {standard.standard}
                    </div>
                  </div>
                </div>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--b1-neutral-gray)' }}>
                  {standard.details}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Technical Disclaimer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mt-16 p-6 border"
          style={{ borderColor: 'var(--b1-border-subtle)', backgroundColor: 'var(--b3-glass-white)' }}
        >
          <div className="flex items-start gap-3">
            <FileText className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--b1-gold-trim)' }} />
            <div className="text-sm leading-relaxed" style={{ color: 'var(--b1-neutral-gray)' }}>
              <strong>Note:</strong> Technical specifications are subject to change as security best practices evolve. GlenKeos maintains compliance with industry-standard encryption protocols and regularly updates infrastructure to address emerging threats.
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
