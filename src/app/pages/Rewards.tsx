import { motion } from "motion/react";
import { Star, Gift, TrendingUp, Award } from "lucide-react";
import { Link } from "react-router";

export function Rewards() {
  const tiers = [
    {
      name: "Member",
      points: "0+",
      benefits: ["Earn 1 point per $1 spent", "Birthday reward", "Exclusive offers"]
    },
    {
      name: "Preferred",
      points: "500+",
      benefits: ["Earn 1.25 points per $1", "Early access to new items", "Free delivery on orders $15+"]
    },
    {
      name: "Elite",
      points: "1,500+",
      benefits: ["Earn 1.5 points per $1", "Priority support", "Exclusive menu items"]
    },
    {
      name: "Executive",
      points: "3,000+",
      benefits: ["Earn 2 points per $1", "VIP events", "Custom orders available"]
    },
    {
      name: "Premier",
      points: "5,000+",
      benefits: ["Earn 2.5 points per $1", "Dedicated support line", "First access to special drops"]
    }
  ];

  const howItWorks = [
    {
      icon: TrendingUp,
      title: "Earn Points Automatically",
      description: "Points are added to your account with every purchase. No manual entry required."
    },
    {
      icon: Award,
      title: "Track Progress",
      description: "View your points balance, tier status, and redemption history in your account dashboard."
    },
    {
      icon: Gift,
      title: "Redeem In-Store or Online",
      description: "Use points for food, upgrades, and exclusive drops. Redeem at checkout or in-store."
    }
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--b1-obsidian)' }}>
      {/* Hero */}
      <section className="py-20 px-6" style={{ backgroundColor: 'var(--b1-black-marble)' }}>
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="w-20 h-20 border mx-auto mb-6 flex items-center justify-center" style={{ borderColor: 'var(--b1-gold-trim)' }}>
              <Star className="w-10 h-10" style={{ color: 'var(--b1-gold-trim)' }} />
            </div>
            <h1 className="mb-6 tracking-[0.2em]" style={{ fontSize: '3.5rem', fontWeight: 500 }}>
              CHIC-ON-CHAIN REWARDS
            </h1>
            <p className="text-xl mb-8 leading-relaxed" style={{ color: 'var(--b1-neutral-gray)' }}>
              Earn points on every order. Redeem for food, upgrades, and exclusive drops.
            </p>
            <Link
              to="/account"
              className="inline-block px-12 py-4 tracking-wider transition-all transform hover:scale-105"
              style={{ backgroundColor: 'var(--b1-gold-minimal)', color: 'var(--b1-black-marble)', fontWeight: 500 }}
            >
              JOIN REWARDS
            </Link>
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16 tracking-[0.15em]"
            style={{ fontSize: '2.5rem', fontWeight: 500 }}
          >
            How It Works
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {howItWorks.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="w-16 h-16 border mx-auto mb-6 flex items-center justify-center" style={{ borderColor: 'var(--b1-gold-trim)' }}>
                  <step.icon className="w-8 h-8" style={{ color: 'var(--b1-gold-trim)' }} />
                </div>
                <h3 className="mb-3 tracking-wider" style={{ fontSize: '1.25rem', fontWeight: 500 }}>
                  {step.title}
                </h3>
                <p className="leading-relaxed" style={{ color: 'var(--b1-neutral-gray)' }}>
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Tiers */}
      <section className="py-20 px-6" style={{ backgroundColor: 'var(--b1-black-marble)' }}>
        <div className="max-w-7xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16 tracking-[0.15em]"
            style={{ fontSize: '2.5rem', fontWeight: 500 }}
          >
            Rewards Tiers
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {tiers.map((tier, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.05 }}
                className="p-6 border"
                style={{ borderColor: 'var(--b1-border-subtle)', backgroundColor: 'var(--b1-obsidian-panel)' }}
              >
                <div className="mb-4 px-3 py-1 text-xs tracking-widest text-center" style={{ backgroundColor: 'var(--b1-gold-minimal)', color: 'var(--b1-black-marble)', fontWeight: 500 }}>
                  {tier.points}
                </div>
                <h3 className="mb-4 text-center tracking-wider" style={{ fontSize: '1.25rem', fontWeight: 500 }}>
                  {tier.name}
                </h3>
                <ul className="space-y-2 text-sm" style={{ color: 'var(--b1-neutral-gray)' }}>
                  {tier.benefits.map((benefit, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span style={{ color: 'var(--b1-gold-trim)' }}>•</span>
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Terms */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="p-8 border"
            style={{ borderColor: 'var(--b1-border-subtle)', backgroundColor: 'var(--b1-obsidian-panel)' }}
          >
            <h3 className="mb-4 tracking-wider" style={{ fontSize: '1.25rem', fontWeight: 500 }}>
              Program Terms
            </h3>
            <div className="space-y-3 text-sm leading-relaxed" style={{ color: 'var(--b1-neutral-gray)' }}>
              <p>
                • Points are earned on qualifying purchases only. Taxes, fees, and tips do not accrue points.
              </p>
              <p>
                • Points are non-transferable and have no cash value. They cannot be sold, traded, or transferred to another account.
              </p>
              <p>
                • Tier status is calculated based on points earned over a rolling 12-month period.
              </p>
              <p>
                • Points expire 12 months from the date of earning if the account remains inactive.
              </p>
              <p>
                • GlenKeos reserves the right to modify, suspend, or terminate the rewards program at any time with notice to members.
              </p>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
