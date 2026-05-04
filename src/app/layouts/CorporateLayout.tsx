import { Outlet, Link, useLocation } from "react-router";
import { motion } from "motion/react";
import { Shield, Building2, Scale, Lock, Database, FolderLock } from "lucide-react";

export function CorporateLayout() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-b3-pure-black text-b1-white-space">
      {/* B3 Ultra-Modern Navigation */}
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl border-b"
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          borderBottomColor: 'var(--b3-glass-border)'
        }}
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo - B1 Corporate Luxury */}
            <Link to="/corporate" className="flex items-center gap-3 group">
              <div className="w-10 h-10 border flex items-center justify-center" style={{ borderColor: 'var(--b1-gold-trim)' }}>
                <div className="text-xl" style={{ color: 'var(--b1-gold-minimal)', fontWeight: 300 }}>
                  Ω
                </div>
              </div>
              <div>
                <div className="text-lg tracking-[0.3em]" style={{ fontWeight: 500, color: 'var(--b1-white-space)' }}>
                  GLENKEOS
                </div>
                <div className="text-xs tracking-wider" style={{ color: 'var(--b3-gold-micro)' }}>
                  Enterprise Infrastructure
                </div>
              </div>
            </Link>

            {/* B3 Minimal Navigation */}
            <div className="hidden md:flex gap-8 text-sm">
              <Link
                to="/corporate"
                className={`tracking-wider transition-colors ${
                  location.pathname === "/corporate"
                    ? "text-b1-gold-trim"
                    : "text-b1-neutral-gray hover:text-b1-white-space"
                }`}
              >
                Overview
              </Link>
              <Link
                to="/corporate/divisions"
                className={`tracking-wider transition-colors ${
                  location.pathname === "/corporate/divisions"
                    ? "text-b1-gold-trim"
                    : "text-b1-neutral-gray hover:text-b1-white-space"
                }`}
              >
                Divisions
              </Link>
              <Link
                to="/corporate/compliance"
                className={`tracking-wider transition-colors ${
                  location.pathname === "/corporate/compliance"
                    ? "text-b1-gold-trim"
                    : "text-b1-neutral-gray hover:text-b1-white-space"
                }`}
              >
                Compliance
              </Link>
              <Link
                to="/corporate/risk-governance"
                className={`tracking-wider transition-colors ${
                  location.pathname === "/corporate/risk-governance"
                    ? "text-b1-gold-trim"
                    : "text-b1-neutral-gray hover:text-b1-white-space"
                }`}
              >
                Risk & Governance
              </Link>
              <Link
                to="/corporate/technology"
                className={`tracking-wider transition-colors ${
                  location.pathname === "/corporate/technology"
                    ? "text-b1-gold-trim"
                    : "text-b1-neutral-gray hover:text-b1-white-space"
                }`}
              >
                Technology
              </Link>
              <Link
                to="/corporate/vault"
                className={`flex items-center gap-2 tracking-wider transition-colors ${
                  location.pathname === "/corporate/vault"
                    ? "text-b1-gold-trim"
                    : "text-b1-neutral-gray hover:text-b1-white-space"
                }`}
              >
                <FolderLock className="w-4 h-4" />
                Vault
              </Link>
            </div>

            {/* Chic on Chain Link */}
            <Link
              to="/"
              className="text-sm tracking-wider transition-colors"
              style={{ color: 'var(--b3-gold-micro)' }}
            >
              Chic on Chain →
            </Link>
          </div>
        </div>
      </motion.nav>

      {/* Page Content */}
      <main className="pt-20">
        <Outlet />
      </main>

      {/* B3 Ultra-Modern Footer */}
      <footer className="py-16 px-6 border-t" style={{ borderTopColor: 'var(--b3-glass-border)' }}>
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 border flex items-center justify-center" style={{ borderColor: 'var(--b1-gold-trim)' }}>
                  <div className="text-sm" style={{ color: 'var(--b1-gold-minimal)', fontWeight: 300 }}>
                    Ω
                  </div>
                </div>
                <span className="tracking-wider" style={{ fontWeight: 500 }}>
                  GLENKEOS
                </span>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--b1-neutral-gray)' }}>
                Enterprise infrastructure for multi-entity operations
              </p>
            </div>

            {/* Corporate */}
            <div>
              <h4 className="mb-4 tracking-wider text-sm" style={{ fontWeight: 500 }}>
                Corporate
              </h4>
              <div className="space-y-2 text-sm" style={{ color: 'var(--b1-neutral-gray)' }}>
                <Link to="/corporate/divisions" className="block hover:text-b1-gold-trim transition-colors">
                  Divisions
                </Link>
                <Link to="/corporate/compliance" className="block hover:text-b1-gold-trim transition-colors">
                  Compliance
                </Link>
                <Link to="/corporate/vault" className="block hover:text-b1-gold-trim transition-colors">
                  Governance Vault
                </Link>
              </div>
            </div>

            {/* Legal */}
            <div>
              <h4 className="mb-4 tracking-wider text-sm" style={{ fontWeight: 500 }}>
                Legal
              </h4>
              <div className="space-y-2 text-sm" style={{ color: 'var(--b1-neutral-gray)' }}>
                <Link to="/corporate/contact" className="block hover:text-b1-gold-trim transition-colors">
                  Privacy Policy
                </Link>
                <Link to="/corporate/contact" className="block hover:text-b1-gold-trim transition-colors">
                  Terms of Service
                </Link>
                <Link to="/corporate/contact" className="block hover:text-b1-gold-trim transition-colors">
                  Data Security
                </Link>
              </div>
            </div>

            {/* Contact */}
            <div>
              <h4 className="mb-4 tracking-wider text-sm" style={{ fontWeight: 500 }}>
                Contact
              </h4>
              <div className="space-y-2 text-sm" style={{ color: 'var(--b1-neutral-gray)' }}>
                <div>legal@glenkeos.com</div>
                <div>compliance@glenkeos.com</div>
                <Link to="/corporate/contact" className="block hover:text-b1-gold-trim transition-colors">
                  Contact Form
                </Link>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t flex items-center justify-between text-xs" style={{ borderTopColor: 'var(--b3-glass-border)', color: 'var(--b1-neutral-gray)' }}>
            <div className="tracking-widest">
              © 2026 GLENKEOS ENTERPRISE SYSTEMS
            </div>
            <div className="tracking-wider">
              Federal-Ready Infrastructure
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
