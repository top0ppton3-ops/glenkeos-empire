import { Outlet, Link as RouterLink, useLocation } from "react-router";
import { motion } from "motion/react";
import { ShoppingCart, User, Link as LinkIcon } from "lucide-react";
import { BrandChain } from "../components/BrandChain";
import { useState } from "react";

export function RootLayout() {
  const location = useLocation();
  const [cartCount] = useState(3); // Mock cart count

  return (
    <div className="min-h-screen text-foreground" style={{ backgroundColor: 'var(--b1-black-marble)' }}>
      {/* Navigation - B1 Primary with Chain Linking */}
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b"
        style={{
          backgroundColor: 'rgba(10, 10, 10, 0.95)',
          borderBottomColor: 'var(--b1-border-subtle)'
        }}
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo - Chain Linking Structure */}
            <RouterLink to="/" className="flex items-center gap-3 group">
              <div className="w-8 h-8 border flex items-center justify-center" style={{ borderColor: 'var(--b1-gold-trim)' }}>
                <LinkIcon className="w-4 h-4" style={{ color: 'var(--b1-gold-minimal)' }} />
              </div>
              <div>
                <BrandChain brand="chic-on-chain" size="sm" showFull={true} />
                <div className="text-xs tracking-wider" style={{ color: 'var(--b3-gold-micro)' }}>
                  by GlenKeos
                </div>
              </div>
            </RouterLink>

            {/* Main Navigation - B1 Executive Tone */}
            <div className="hidden md:flex gap-8 text-sm">
              <RouterLink
                to="/"
                className={`tracking-wider transition-colors ${
                  location.pathname === "/"
                    ? "text-b1-gold-trim"
                    : "text-b1-neutral-gray hover:text-b1-white-space"
                }`}
              >
                Home
              </RouterLink>
              <RouterLink
                to="/menu"
                className={`tracking-wider transition-colors ${
                  location.pathname.startsWith("/menu")
                    ? "text-b1-gold-trim"
                    : "text-b1-neutral-gray hover:text-b1-white-space"
                }`}
              >
                Menu
              </RouterLink>
              <RouterLink
                to="/locations"
                className={`tracking-wider transition-colors ${
                  location.pathname === "/locations"
                    ? "text-b1-gold-trim"
                    : "text-b1-neutral-gray hover:text-b1-white-space"
                }`}
              >
                Locations
              </RouterLink>
              <RouterLink
                to="/rewards"
                className={`tracking-wider transition-colors ${
                  location.pathname === "/rewards"
                    ? "text-b1-gold-trim"
                    : "text-b1-neutral-gray hover:text-b1-white-space"
                }`}
              >
                Rewards
              </RouterLink>
              <RouterLink
                to="/account"
                className={`tracking-wider transition-colors ${
                  location.pathname === "/account"
                    ? "text-b1-gold-trim"
                    : "text-b1-neutral-gray hover:text-b1-white-space"
                }`}
              >
                Account
              </RouterLink>
            </div>

            {/* Cart & User Actions */}
            <div className="flex items-center gap-4">
              <RouterLink
                to="/cart"
                className="relative p-2 transition-colors"
                style={{ color: 'var(--b1-neutral-gray)' }}
              >
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 text-xs flex items-center justify-center rounded-full" style={{ backgroundColor: 'var(--b1-gold-minimal)', color: 'var(--b1-black-marble)' }}>
                    {cartCount}
                  </span>
                )}
              </RouterLink>
              <RouterLink
                to="/account"
                className="p-2 transition-colors"
                style={{ color: 'var(--b1-neutral-gray)' }}
              >
                <User className="w-5 h-5" />
              </RouterLink>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Page Content */}
      <main className="pt-20">
        <Outlet />
      </main>

      {/* Footer - B1 Three-Column Layout */}
      <footer className="relative py-8 px-6 border-t mt-32" style={{ backgroundColor: 'var(--b1-black-marble)', borderTopColor: 'var(--b1-border-subtle)' }}>
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Left: Copyright */}
            <div className="flex items-center gap-2 text-xs tracking-widest" style={{ color: 'var(--b1-neutral-gray)' }}>
              <LinkIcon className="w-4 h-4" style={{ color: 'var(--b1-gold-trim)' }} />
              <span>© 2026 CHIC-ON-CHAIN</span>
            </div>

            {/* Center: Footer Links */}
            <div className="flex items-center gap-6 text-xs tracking-wider" style={{ color: 'var(--b1-neutral-gray)' }}>
              <RouterLink to="/support" className="hover:text-b1-gold-trim transition-colors">
                Support
              </RouterLink>
              <span>|</span>
              <RouterLink to="/legal" className="hover:text-b1-gold-trim transition-colors">
                Legal
              </RouterLink>
              <span>|</span>
              <RouterLink to="/privacy" className="hover:text-b1-gold-trim transition-colors">
                Privacy
              </RouterLink>
              <span>|</span>
              <RouterLink to="/accessibility" className="hover:text-b1-gold-trim transition-colors">
                Accessibility
              </RouterLink>
            </div>

            {/* Right: GlenKeos Link */}
            <div className="text-xs tracking-wider" style={{ color: 'var(--b1-neutral-gray)' }}>
              <RouterLink to="/corporate" className="hover:text-b1-gold-trim transition-colors">
                A GlenKeos Enterprise →
              </RouterLink>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
