import { Link } from "react-router";
import { motion } from "motion/react";
import { Link2, Shield, Crown, ShoppingBag } from "lucide-react";
import { Card } from "../components/core/Card";

export function BrandSelector() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative">
      {/* Hidden Corporate Access - Chain Link in top right */}
      <Link
        to="/corporate"
        className="absolute top-8 right-8 group"
        title="Corporate Information"
      >
        <motion.div
          whileHover={{ scale: 1.1, rotate: 15 }}
          whileTap={{ scale: 0.95 }}
          className="w-12 h-12 rounded-lg flex items-center justify-center backdrop-blur-sm transition-all"
          style={{
            background: 'linear-gradient(135deg, rgba(0,0,0,0.3), rgba(0,0,0,0.5))',
            border: '1px solid rgba(212, 175, 55, 0.2)',
          }}
        >
          <Link2
            className="w-5 h-5 transition-all group-hover:text-amber-400"
            style={{ color: 'rgba(212, 175, 55, 0.4)' }}
          />
        </motion.div>
      </Link>

      {/* Operations Portal Access - Shield icon in top left */}
      <Link
        to="/internal"
        className="absolute top-8 left-8 group"
        title="COC Command Center"
      >
        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="px-4 py-3 rounded-lg flex items-center gap-2 backdrop-blur-sm transition-all"
          style={{
            background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.1), rgba(212, 175, 55, 0.2))',
            border: '1px solid rgba(212, 175, 55, 0.3)',
          }}
        >
          <Shield
            className="w-5 h-5 transition-all"
            style={{ color: 'var(--b1-gold-trim)' }}
          />
          <span
            className="text-sm font-semibold tracking-wide transition-all group-hover:tracking-wider"
            style={{ color: 'var(--b1-gold-trim)' }}
          >
            COC
          </span>
        </motion.div>
      </Link>

      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16 mt-8">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-6xl font-bold text-white mb-4"
          >
            GlenKeos
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-xl text-slate-300"
          >
            Multi-Brand Enterprise Platform
          </motion.p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Chic-on-Chain - Green */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <Card className="h-full bg-gradient-to-br from-emerald-900 to-emerald-950 border-emerald-700 hover:border-emerald-500 transition-all duration-300">
              <div className="p-8 text-center">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-emerald-500 flex items-center justify-center">
                  <span className="text-4xl">🍽️</span>
                </div>
                <h2 className="text-3xl font-bold text-emerald-400 mb-3">Chic-on-Chain</h2>
                <p className="text-emerald-200 mb-6">Premium Restaurant Operations</p>
                <div className="space-y-2 text-sm text-emerald-300">
                  <div className="flex items-center justify-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                    <span>Fine Dining</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                    <span>Corporate Events</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                    <span>Premium Catering</span>
                  </div>
                </div>
                
                <div className="mt-8 space-y-3">
                  <Link to="/chic-on-chain/menu" className="block group">
                    <div className="py-3 px-6 bg-emerald-500 text-white rounded-lg font-semibold group-hover:bg-emerald-400 transition-colors flex items-center justify-center gap-2">
                      <ShoppingBag className="w-5 h-5" />
                      Order Now
                    </div>
                  </Link>
                  <Link to="/chic-on-chain" className="block">
                    <div className="py-2 px-6 border border-emerald-500 text-emerald-300 rounded-lg text-sm hover:bg-emerald-900/30 transition-colors">
                      Operations Dashboard
                    </div>
                  </Link>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Ghetto Eats - Blue */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <Card className="h-full bg-gradient-to-br from-blue-900 to-blue-950 border-blue-700 hover:border-blue-500 transition-all duration-300">
              <div className="p-8 text-center">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-blue-500 flex items-center justify-center">
                  <span className="text-4xl">🚚</span>
                </div>
                <h2 className="text-3xl font-bold text-blue-400 mb-3">Ghetto Eats</h2>
                <p className="text-blue-200 mb-6">Fast Delivery & Street Food</p>
                <div className="space-y-2 text-sm text-blue-300">
                  <div className="flex items-center justify-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                    <span>Quick Service</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                    <span>Delivery Network</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                    <span>Street Food</span>
                  </div>
                </div>
                
                <div className="mt-8 space-y-3">
                  <Link to="/ghetto-eats/menu" className="block group">
                    <div className="py-3 px-6 bg-blue-500 text-white rounded-lg font-semibold group-hover:bg-blue-400 transition-colors flex items-center justify-center gap-2">
                      <ShoppingBag className="w-5 h-5" />
                      Order Delivery
                    </div>
                  </Link>
                  <Link to="/ghetto-eats" className="block">
                    <div className="py-2 px-6 border border-blue-500 text-blue-300 rounded-lg text-sm hover:bg-blue-900/30 transition-colors">
                      Operations Dashboard
                    </div>
                  </Link>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* GoldKey - Ultra Premium */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <Card className="h-full relative overflow-hidden border-2 transition-all duration-500 hover:shadow-2xl"
              style={{
                background: 'linear-gradient(135deg, rgba(0,0,0,0.95), rgba(26,26,26,0.95))',
                borderColor: 'var(--b1-gold-trim)'
              }}
            >
              {/* Luxury gold shimmer effect */}
              <div className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity"
                style={{
                  background: `radial-gradient(circle at 50% 0%, var(--b1-gold-trim), transparent 70%)`
                }}
              />

              <div className="p-8 text-center relative z-10">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full border-2 flex items-center justify-center backdrop-blur-sm transition-all hover:scale-110 hover:rotate-12"
                  style={{
                    borderColor: 'var(--b1-gold-trim)',
                    background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.2), rgba(212, 175, 55, 0.05))'
                  }}
                >
                  <Crown className="w-10 h-10" style={{ color: 'var(--b1-gold-trim)' }} />
                </div>

                <h2 className="text-3xl font-bold mb-3 tracking-wider" style={{ color: 'var(--b1-gold-trim)' }}>
                  GoldKey
                </h2>

                <p className="mb-6 text-sm tracking-wide" style={{ color: 'var(--b1-gold-minimal)' }}>
                  Ultra-Premium Concierge
                </p>

                <div className="space-y-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  <div className="flex items-center justify-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--b1-gold-trim)' }}></span>
                    <span>Exclusive VIP Access</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--b1-gold-trim)' }}></span>
                    <span>Bespoke Events</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--b1-gold-trim)' }}></span>
                    <span>White-Glove Service</span>
                  </div>
                </div>

                <div className="mt-8 space-y-3">
                  <Link to="/goldkey/concierge" className="block group">
                    <div className="py-3 px-6 rounded-lg font-bold tracking-wide transition-all group-hover:tracking-wider flex items-center justify-center gap-2"
                      style={{
                        background: 'linear-gradient(135deg, var(--b1-gold-trim), var(--b1-gold-minimal))',
                        color: 'var(--b1-black-marble)',
                        boxShadow: '0 4px 20px rgba(212, 175, 55, 0.3)'
                      }}
                    >
                      <Crown className="w-5 h-5" />
                      VIP Concierge
                    </div>
                  </Link>
                  <Link to="/goldkey/events" className="block group">
                    <div className="py-2 px-6 border rounded-lg text-sm transition-colors"
                      style={{
                        borderColor: 'var(--b1-gold-trim)',
                        color: 'var(--b1-gold-minimal)'
                      }}
                    >
                      Event Hosting
                    </div>
                  </Link>
                  <Link to="/goldkey" className="block">
                    <div className="py-2 px-6 border text-sm rounded-lg transition-colors opacity-60 hover:opacity-100"
                      style={{
                        borderColor: 'var(--b1-gold-trim)',
                        color: 'var(--b1-gold-minimal)'
                      }}
                    >
                      Operations Dashboard
                    </div>
                  </Link>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Footer Legal Text */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="mt-16 text-center text-xs"
          style={{ color: 'rgba(148, 163, 184, 0.5)' }}
        >
          <p>© 2026 GlenKeos Holdings. All rights reserved.</p>
          <p className="mt-1">A multi-brand hospitality enterprise</p>
        </motion.div>
      </div>
    </div>
  );
}