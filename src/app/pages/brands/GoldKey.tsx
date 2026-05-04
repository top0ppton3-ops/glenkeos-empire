import { useEffect, useState } from "react";
import { Link } from "react-router";
import { motion } from "motion/react";
import { Crown, Shield, Sparkles, ArrowRight, Phone, Mail, MapPin } from "lucide-react";
import { api } from "../../services/api";
import { Card } from "../../components/core/Card";
import { Button } from "../../components/core/Button";
import { Loader } from "../../components/feedback/Loader";

export function GoldKey() {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [stores, setStores] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [ordersData, storesData] = await Promise.all([
          api.orders.list({ brand: 'goldkey', limit: 5 }),
          api.stores.list({ brand: 'goldkey' })
        ]);
        setOrders(ordersData.orders || []);
        setStores(storesData.stores || []);
      } catch (error) {
        console.error('Failed to load data:', error);
        setOrders([]);
        setStores([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--b1-black-marble)' }}>
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--b1-black-marble)' }}>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Gold gradient background */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[800px]"
               style={{ background: `radial-gradient(ellipse at top, var(--b1-gold-trim), transparent)` }}></div>
        </div>

        <div className="container mx-auto px-6 py-24 relative z-10">
          <div className="flex items-center justify-between mb-12">
            <Link to="/" className="transition-all hover:opacity-70" style={{ color: 'var(--b1-gold-trim)' }}>
              ← Back
            </Link>
            <Link to="/internal/operations">
              <Button variant="secondary" className="border" style={{ borderColor: 'var(--b1-gold-trim)' }}>
                Operations Portal
              </Button>
            </Link>
          </div>

          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="mb-8 flex justify-center"
            >
              <div
                className="w-32 h-32 rounded-full flex items-center justify-center border-2 backdrop-blur-sm"
                style={{
                  borderColor: 'var(--b1-gold-trim)',
                  background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.1), rgba(212, 175, 55, 0.05))'
                }}
              >
                <Crown className="w-16 h-16" style={{ color: 'var(--b1-gold-trim)' }} />
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-6xl font-bold mb-6 tracking-tight"
              style={{ color: 'var(--b1-gold-trim)' }}
            >
              GoldKey
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-2xl mb-8"
              style={{ color: 'var(--b1-gold-minimal)' }}
            >
              Ultra-Premium Concierge Services
            </motion.p>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="text-lg max-w-2xl mx-auto mb-12 leading-relaxed"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Exclusive access to world-class experiences, private events, and bespoke hospitality services.
              Reserved for distinguished members only.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="flex gap-4 justify-center"
            >
              <Button
                variant="primary"
                className="px-8 py-4 text-lg"
                style={{
                  background: 'linear-gradient(135deg, var(--b1-gold-trim), var(--b1-gold-minimal))',
                  color: 'var(--b1-black-marble)'
                }}
                rightIcon={<ArrowRight className="w-5 h-5" />}
              >
                Request Access
              </Button>
              <Button
                variant="secondary"
                className="px-8 py-4 text-lg border-2"
                style={{ borderColor: 'var(--b1-gold-trim)', color: 'var(--b1-gold-trim)' }}
              >
                Learn More
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-24 px-6">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-4xl font-bold text-center mb-16" style={{ color: 'var(--b1-gold-trim)' }}>
            Exclusive Services
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Crown,
                title: "VIP Experiences",
                description: "Curated access to private events, galas, and exclusive gatherings"
              },
              {
                icon: Sparkles,
                title: "Private Events",
                description: "Bespoke event planning and execution with white-glove service"
              },
              {
                icon: Shield,
                title: "Concierge Support",
                description: "24/7 dedicated concierge team for all your hospitality needs"
              }
            ].map((service, idx) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 + idx * 0.2, duration: 0.6 }}
              >
                <Card
                  className="h-full p-8 border transition-all hover:scale-105"
                  style={{
                    backgroundColor: 'var(--b1-obsidian-panel)',
                    borderColor: 'var(--b1-border-subtle)'
                  }}
                >
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center mb-6"
                    style={{ backgroundColor: 'rgba(212, 175, 55, 0.1)' }}
                  >
                    <service.icon className="w-8 h-8" style={{ color: 'var(--b1-gold-trim)' }} />
                  </div>
                  <h3 className="text-2xl font-bold mb-4" style={{ color: 'var(--b1-gold-trim)' }}>
                    {service.title}
                  </h3>
                  <p style={{ color: 'var(--color-text-secondary)' }}>
                    {service.description}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Membership Tiers */}
      <section className="py-24 px-6" style={{ backgroundColor: 'var(--b1-obsidian)' }}>
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-4xl font-bold text-center mb-16" style={{ color: 'var(--b1-gold-trim)' }}>
            Membership Tiers
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { name: "Gold", price: "By Invitation", features: ["Priority Reservations", "Exclusive Events", "Dedicated Support"] },
              { name: "Platinum", price: "By Application", features: ["All Gold Benefits", "Private Events Access", "Personal Concierge", "Annual Experiences"] },
              { name: "Diamond", price: "Reserved", features: ["All Platinum Benefits", "Unlimited Access", "Global Network", "Bespoke Services"] }
            ].map((tier, idx) => (
              <motion.div
                key={tier.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.6 + idx * 0.2, duration: 0.6 }}
              >
                <Card
                  className="p-8 text-center border-2 transition-all hover:scale-105"
                  style={{
                    backgroundColor: idx === 1 ? 'rgba(212, 175, 55, 0.05)' : 'var(--b1-obsidian-panel)',
                    borderColor: idx === 1 ? 'var(--b1-gold-trim)' : 'var(--b1-border-subtle)'
                  }}
                >
                  <h3 className="text-2xl font-bold mb-2" style={{ color: 'var(--b1-gold-trim)' }}>
                    {tier.name}
                  </h3>
                  <p className="text-xl mb-6" style={{ color: 'var(--b1-gold-minimal)' }}>
                    {tier.price}
                  </p>
                  <div className="space-y-3">
                    {tier.features.map(feature => (
                      <p key={feature} className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                        {feature}
                      </p>
                    ))}
                  </div>
                  <Button
                    variant="secondary"
                    className="mt-8 w-full border"
                    style={{ borderColor: 'var(--b1-gold-trim)', color: 'var(--b1-gold-trim)' }}
                  >
                    Inquire
                  </Button>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-24 px-6">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl font-bold mb-8" style={{ color: 'var(--b1-gold-trim)' }}>
            Get in Touch
          </h2>
          <p className="text-lg mb-12" style={{ color: 'var(--color-text-secondary)' }}>
            Our team is available to discuss membership and services
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center">
              <Phone className="w-8 h-8 mb-4" style={{ color: 'var(--b1-gold-trim)' }} />
              <p style={{ color: 'var(--color-text-secondary)' }}>+1 (555) 000-GOLD</p>
            </div>
            <div className="flex flex-col items-center">
              <Mail className="w-8 h-8 mb-4" style={{ color: 'var(--b1-gold-trim)' }} />
              <p style={{ color: 'var(--color-text-secondary)' }}>concierge@goldkey.com</p>
            </div>
            <div className="flex flex-col items-center">
              <MapPin className="w-8 h-8 mb-4" style={{ color: 'var(--b1-gold-trim)' }} />
              <p style={{ color: 'var(--color-text-secondary)' }}>Beverly Hills, CA</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t" style={{ borderColor: 'var(--b1-border-subtle)' }}>
        <div className="container mx-auto text-center">
          <p className="text-sm" style={{ color: 'rgba(148, 163, 184, 0.5)' }}>
            © 2026 GoldKey. A GlenKeos Holdings company. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}