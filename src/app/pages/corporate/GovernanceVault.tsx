import { motion } from "motion/react";
import { FolderLock, FileText, Shield, Lock, Download, Eye, Clock } from "lucide-react";

export function GovernanceVault() {
  const documentCategories = [
    {
      category: "Standard Operating Procedures",
      icon: FileText,
      documents: [
        {
          title: "Chic on Chain Operations Manual",
          version: "v2.1",
          lastUpdated: "2026-03-15",
          accessLevel: "Management",
          size: "2.4 MB"
        },
        {
          title: "Kitchen Safety & Compliance Procedures",
          version: "v1.8",
          lastUpdated: "2026-03-10",
          accessLevel: "All Staff",
          size: "1.1 MB"
        },
        {
          title: "COC Command Audit Protocol",
          version: "v3.0",
          lastUpdated: "2026-04-01",
          accessLevel: "Executive",
          size: "3.2 MB"
        }
      ]
    },
    {
      category: "Compliance & Legal",
      icon: Shield,
      documents: [
        {
          title: "Master Compliance Manual",
          version: "v4.2",
          lastUpdated: "2026-04-05",
          accessLevel: "Executive",
          size: "5.8 MB"
        },
        {
          title: "Food Safety Certification Requirements",
          version: "v2.0",
          lastUpdated: "2026-02-20",
          accessLevel: "Management",
          size: "900 KB"
        },
        {
          title: "Intercompany Agreement Template",
          version: "v1.5",
          lastUpdated: "2026-01-15",
          accessLevel: "Legal",
          size: "450 KB"
        }
      ]
    },
    {
      category: "Human Resources",
      icon: FileText,
      documents: [
        {
          title: "Employee Handbook 2026",
          version: "v6.0",
          lastUpdated: "2026-01-01",
          accessLevel: "All Staff",
          size: "2.1 MB"
        },
        {
          title: "Workplace Conduct Policy",
          version: "v3.1",
          lastUpdated: "2026-02-15",
          accessLevel: "All Staff",
          size: "680 KB"
        },
        {
          title: "Benefits & Compensation Structure",
          version: "v2.3",
          lastUpdated: "2026-03-01",
          accessLevel: "HR Only",
          size: "1.5 MB"
        }
      ]
    },
    {
      category: "Data Privacy & Security",
      icon: Lock,
      documents: [
        {
          title: "Data Privacy Policy",
          version: "v3.5",
          lastUpdated: "2026-03-28",
          accessLevel: "Management",
          size: "1.8 MB"
        },
        {
          title: "Incident Response Plan",
          version: "v2.2",
          lastUpdated: "2026-03-20",
          accessLevel: "IT & Security",
          size: "2.3 MB"
        },
        {
          title: "Zero-Trust Security Framework",
          version: "v1.9",
          lastUpdated: "2026-04-10",
          accessLevel: "Executive",
          size: "3.1 MB"
        }
      ]
    },
    {
      category: "Risk & Governance",
      icon: Shield,
      documents: [
        {
          title: "Enterprise Risk Matrix 2026",
          version: "v4.0",
          lastUpdated: "2026-04-01",
          accessLevel: "Executive",
          size: "4.2 MB"
        },
        {
          title: "Quarterly Compliance Report Q1 2026",
          version: "v1.0",
          lastUpdated: "2026-04-12",
          accessLevel: "Board",
          size: "6.5 MB"
        },
        {
          title: "Entity Shielding Documentation",
          version: "v2.8",
          lastUpdated: "2026-03-25",
          accessLevel: "Legal",
          size: "3.7 MB"
        }
      ]
    },
    {
      category: "Technology & Systems",
      icon: Lock,
      documents: [
        {
          title: "API Documentation & Security",
          version: "v5.1",
          lastUpdated: "2026-04-08",
          accessLevel: "Development",
          size: "2.9 MB"
        },
        {
          title: "Database Encryption Standards",
          version: "v3.0",
          lastUpdated: "2026-03-15",
          accessLevel: "IT & Security",
          size: "1.4 MB"
        },
        {
          title: "Immutable Audit Trail Specification",
          version: "v2.5",
          lastUpdated: "2026-04-05",
          accessLevel: "Executive",
          size: "2.2 MB"
        }
      ]
    }
  ];

  const getAccessLevelColor = (level: string) => {
    switch (level) {
      case "Executive":
      case "Board":
      case "Legal":
        return "var(--b1-gold-minimal)";
      case "Management":
      case "IT & Security":
        return "var(--b3-gold-micro)";
      case "All Staff":
        return "var(--b1-neutral-gray)";
      default:
        return "var(--b1-neutral-gray)";
    }
  };

  return (
    <div className="min-h-screen py-12 px-6" style={{ backgroundColor: 'var(--b3-pure-black)' }}>
      <div className="max-w-7xl mx-auto">
        {/* Header - B3 Ultra-Modern */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-16"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 border flex items-center justify-center" style={{ borderColor: 'var(--b1-gold-trim)' }}>
              <FolderLock className="w-8 h-8" style={{ color: 'var(--b1-gold-trim)' }} />
            </div>
            <div>
              <h1 className="tracking-[0.2em] mb-2" style={{ fontSize: '3rem', fontWeight: 500 }}>
                GOVERNANCE VAULT
              </h1>
              <p className="text-lg tracking-wide" style={{ color: 'var(--b3-gold-micro)' }}>
                Secure Document Repository
              </p>
            </div>
          </div>
          <p className="text-lg leading-relaxed max-w-3xl" style={{ color: 'var(--b1-neutral-gray)' }}>
            Enterprise-grade document management for SOPs, compliance manuals, employee handbooks, legal agreements, and governance frameworks. All documents are version-controlled, access-restricted, and audit-logged.
          </p>
        </motion.div>

        {/* Document Categories */}
        <div className="space-y-12">
          {documentCategories.map((category, catIndex) => (
            <motion.div
              key={catIndex}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: catIndex * 0.1 }}
            >
              {/* Category Header */}
              <div className="flex items-center gap-3 mb-6 pb-4 border-b" style={{ borderBottomColor: 'var(--b3-glass-border)' }}>
                <category.icon className="w-6 h-6" style={{ color: 'var(--b1-gold-trim)' }} />
                <h2 className="tracking-wider" style={{ fontSize: '1.5rem', fontWeight: 500 }}>
                  {category.category}
                </h2>
              </div>

              {/* Documents Grid */}
              <div className="grid grid-cols-1 gap-4">
                {category.documents.map((doc, docIndex) => (
                  <motion.div
                    key={docIndex}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: catIndex * 0.1 + docIndex * 0.05 }}
                    className="group p-6 border backdrop-blur-sm hover:border-b1-gold-trim transition-all cursor-pointer"
                    style={{
                      backgroundColor: 'var(--b3-glass-white)',
                      borderColor: 'var(--b3-glass-border)'
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="tracking-wide group-hover:text-b1-gold-trim transition-colors" style={{ fontSize: '1.1rem', fontWeight: 500 }}>
                            {doc.title}
                          </h3>
                          <div className="px-2 py-1 text-xs tracking-widest border" style={{ borderColor: getAccessLevelColor(doc.accessLevel), color: getAccessLevelColor(doc.accessLevel) }}>
                            {doc.accessLevel}
                          </div>
                        </div>

                        <div className="flex items-center gap-6 text-sm" style={{ color: 'var(--b1-neutral-gray)' }}>
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            <span>{doc.version}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            <span>Updated {doc.lastUpdated}</span>
                          </div>
                          <div>{doc.size}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 ml-6">
                        <button
                          className="p-2 border hover:bg-b3-glass-white transition-all"
                          style={{ borderColor: 'var(--b3-glass-border)' }}
                          title="Preview"
                        >
                          <Eye className="w-5 h-5" style={{ color: 'var(--b1-neutral-gray)' }} />
                        </button>
                        <button
                          className="p-2 border transition-all"
                          style={{ borderColor: 'var(--b1-gold-trim)', backgroundColor: 'var(--b1-gold-minimal)', color: 'var(--b1-black-marble)' }}
                          title="Download"
                        >
                          <Download className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Security Notice - B1 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-16 p-8 border"
          style={{ borderColor: 'var(--b1-gold-trim)', backgroundColor: 'var(--b1-obsidian-panel)' }}
        >
          <div className="flex items-start gap-4">
            <Lock className="w-6 h-6 flex-shrink-0" style={{ color: 'var(--b1-gold-trim)' }} />
            <div>
              <h3 className="mb-2 tracking-wider" style={{ fontWeight: 500 }}>
                Security & Access Control
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--b1-neutral-gray)' }}>
                All document access is logged with immutable audit trails. Role-based permissions enforce need-to-know access. Documents are encrypted at rest and in transit. Version history is maintained indefinitely for compliance purposes.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
