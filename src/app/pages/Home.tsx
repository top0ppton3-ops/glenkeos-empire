import { motion } from "motion/react";
import { Link } from "react-router";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { TrustRow } from "../components/TrustRow";
import { BrandChain } from "../components/BrandChain";
import { Clock, Star, Award, Utensils } from "lucide-react";

export function Home() {
  const features = [
    {
      icon: Award,
      title: "Precision Standards",
      description: "Controlled preparation and consistent execution across all locations"
    },
    {
      icon: Utensils,
      title: "Quality Ingredients",
      description: "Every item built on certified ingredients and clear specifications"
    },
    {
      icon: Clock,
      title: "Everyday Reliability",
      description: "Consistent experience whether in-store, online, or delivery"
    }
  ];

  const featuredItems = [
    {
      id: "classic-fried-chicken",
      name: "Classic Fried Chicken",
      category: "Signature",
      price: 14.99,
      description: "Crispy, golden-fried chicken prepared to consistent standards",
      image: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=800&q=80"
    },
    {
      id: "spicy-sandwich",
      name: "Spicy Chicken Sandwich",
      category: "Sandwich",
      price: 12.99,
      description: "Heat-controlled spice blend with fresh slaw and pickles",
      image: "https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=800&q=80"
    },
    {
      id: "tenders-combo",
      name: "Tenders Combo",
      category: "Combo",
      price: 16.99,
      description: "Hand-breaded tenders with your choice of side and drink",
      image: "https://images.unsplash.com/photo-1562967914-608f82629710?w=800&q=80"
    }
  ];

  return (
    <div>
      {/* Hero - B1 Primary with B2 Visual Accent */}
      <section className="relative h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0" style={{ backgroundColor: 'var(--b1-black-marble)' }}>
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1606125202241-63545e283fad?w=1920&q=80"
            alt="Premium dining"
            className="w-full h-full object-cover opacity-15"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-b1-black-marble/90 via-b1-black-marble/70 to-b1-black-marble"></div>
        </div>

        {/* B2 Subtle Gold Glow */}
        <div className="absolute inset-0">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full blur-3xl" style={{ backgroundColor: 'var(--b2-gold-fire-dim)' }}></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 text-center px-6 max-w-4xl">
          {/* B2 Visual Accent - Laurel Mark */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 1 }}
            className="mb-8 flex justify-center"
          >
            <div className="w-20 h-20 border flex items-center justify-center" style={{ borderColor: 'var(--b1-gold-trim)' }}>
              <div className="text-3xl" style={{ color: 'var(--b1-gold-minimal)', fontWeight: 300 }}>
                Ω
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="mb-4 flex justify-center"
          >
            <div style={{ fontSize: '2.5rem' }}>
              <BrandChain brand="chic-on-chain" size="lg" showFull={true} />
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="text-3xl md:text-4xl tracking-wide mb-8"
            style={{ color: 'var(--b1-white-space)', fontWeight: 500 }}
          >
            Real flavor. Real consistency. Real craft.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="text-lg md:text-xl mb-6 max-w-2xl mx-auto"
            style={{ color: 'var(--b1-gold-trim)' }}
          >
            A modern chicken experience built on precision, quality, and everyday reliability.
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="text-base mb-12 max-w-3xl mx-auto leading-relaxed"
            style={{ color: 'var(--b1-neutral-gray)' }}
          >
            Chic-on-Chain delivers a clean, elevated take on fast-casual chicken. Every item is built on controlled preparation, consistent execution, and a menu designed for clarity and speed. Whether you're ordering in-store, online, or through Ghetto Eats delivery, the experience stays the same: simple, accurate, and high-quality.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link
              to="/menu"
              className="px-12 py-4 tracking-wider transition-all transform hover:scale-105"
              style={{ backgroundColor: 'var(--b1-gold-minimal)', color: 'var(--b1-black-marble)', fontWeight: 500 }}
            >
              ORDER NOW
            </Link>
            <Link
              to="/menu"
              className="px-12 py-4 border tracking-wider transition-all hover:bg-white/10"
              style={{ borderColor: 'var(--b1-gold-trim)', color: 'var(--b1-gold-trim)' }}
            >
              VIEW MENU
            </Link>
            <Link
              to="/api-demo"
              className="px-12 py-4 border tracking-wider transition-all bg-green-600 border-green-600 text-white hover:bg-green-700"
            >
              📚 API DEMO
            </Link>
            <Link
              to="/test-backend"
              className="px-12 py-4 border tracking-wider transition-all bg-blue-600 border-blue-600 text-white hover:bg-blue-700"
            >
              🔧 TEST BACKEND
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Trust Row - B1 Compliance */}
      <TrustRow />

      {/* Features - B1 */}
      <section className="py-24 px-6" style={{ backgroundColor: 'var(--b1-obsidian)' }}>
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="mb-6 flex justify-center">
                  <div className="w-16 h-16 border flex items-center justify-center" style={{ borderColor: 'var(--b1-gold-trim)' }}>
                    <feature.icon className="w-8 h-8" style={{ color: 'var(--b1-gold-trim)' }} />
                  </div>
                </div>
                <h3 className="mb-3 tracking-wider" style={{ fontSize: '1.1rem', fontWeight: 500 }}>
                  {feature.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--b1-neutral-gray)' }}>
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Items */}
      <section className="py-24 px-6" style={{ backgroundColor: 'var(--b1-black-marble)' }}>
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="mb-4 tracking-[0.15em]" style={{ fontSize: '2.5rem', fontWeight: 500 }}>
              Popular Selections
            </h2>
            <p className="text-lg tracking-wide" style={{ color: 'var(--b1-neutral-gray)' }}>
              Straightforward items. Clean flavors. No confusion.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
              >
                <Link to={`/menu/${item.id}`} className="group block">
                  <div className="relative overflow-hidden mb-4 border group-hover:border-b1-gold-trim transition-colors" style={{ borderColor: 'var(--b1-border-subtle)' }}>
                    <ImageWithFallback
                      src={item.image}
                      alt={item.name}
                      className="w-full aspect-[4/3] object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-4 right-4">
                      <div className="px-3 py-1 text-xs tracking-widest" style={{ backgroundColor: 'var(--b1-gold-minimal)', color: 'var(--b1-black-marble)', fontWeight: 500 }}>
                        {item.category}
                      </div>
                    </div>
                  </div>

                  <div className="px-4">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="tracking-wide group-hover:text-b1-gold-trim transition-colors" style={{ fontSize: '1.25rem', fontWeight: 500 }}>
                        {item.name}
                      </h3>
                      <div className="flex items-center gap-1" style={{ color: 'var(--b1-gold-minimal)' }}>
                        <Star className="w-4 h-4 fill-current" />
                        <span className="text-sm">4.9</span>
                      </div>
                    </div>

                    <p className="text-sm mb-4 leading-relaxed" style={{ color: 'var(--b1-neutral-gray)' }}>
                      {item.description}
                    </p>

                    <div className="flex items-center justify-between">
                      <span className="text-2xl" style={{ fontWeight: 500, color: 'var(--b1-gold-minimal)' }}>
                        ${item.price}
                      </span>
                      <span className="text-sm tracking-wider group-hover:underline" style={{ color: 'var(--b1-gold-trim)' }}>
                        VIEW →
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              to="/menu"
              className="inline-block px-10 py-3 border tracking-wider transition-all"
              style={{ borderColor: 'var(--b1-gold-trim)', color: 'var(--b1-gold-trim)' }}
            >
              EXPLORE FULL MENU
            </Link>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-24 px-6" style={{ backgroundColor: 'var(--b1-obsidian)' }}>
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="mb-6 tracking-[0.15em]" style={{ fontSize: '2.5rem', fontWeight: 500 }}>
              Chic-on-Chain Rewards
            </h2>
            <p className="text-lg mb-8 leading-relaxed" style={{ color: 'var(--b1-neutral-gray)' }}>
              Earn points on every order. Redeem for food, upgrades, and exclusive drops. Track progress in your account.
            </p>
            <Link
              to="/rewards"
              className="inline-block px-12 py-4 tracking-wider transition-all transform hover:scale-105"
              style={{ backgroundColor: 'var(--b1-gold-minimal)', color: 'var(--b1-black-marble)', fontWeight: 500 }}
            >
              JOIN REWARDS
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}