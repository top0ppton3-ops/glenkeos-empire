import { motion } from "motion/react";
import { Link } from "react-router";
import { Shield, Star, Package, MapPin, User, Mail, Phone, LogOut } from "lucide-react";

export function Account() {
  const user = {
    name: "Marcus Aurelius",
    email: "marcus@chiconchainfans.com",
    phone: "(555) 123-4567",
    tier: "Executive",
    rewardPoints: 2847,
    memberSince: "January 2025"
  };

  const recentOrders = [
    {
      id: "ORD-2026-001",
      date: "April 12, 2026",
      items: 3,
      total: 89.19,
      status: "Delivered"
    },
    {
      id: "ORD-2026-002",
      date: "April 8, 2026",
      items: 2,
      total: 45.98,
      status: "Delivered"
    },
    {
      id: "ORD-2026-003",
      date: "April 3, 2026",
      items: 4,
      total: 112.50,
      status: "Delivered"
    }
  ];

  const rewardTiers = [
    { tier: "Member", points: 0 },
    { tier: "Preferred", points: 500 },
    { tier: "Elite", points: 1500 },
    { tier: "Executive", points: 3000, current: true },
    { tier: "Premier", points: 5000 }
  ];

  const currentTier = rewardTiers.find(t => t.current);
  const nextTier = rewardTiers[rewardTiers.findIndex(t => t.current) + 1];
  const progress = nextTier ? ((user.rewardPoints - currentTier!.points) / (nextTier.points - currentTier!.points)) * 100 : 100;

  return (
    <div className="min-h-screen py-12 px-6" style={{ backgroundColor: 'var(--b1-obsidian)' }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-12"
        >
          <div className="flex items-center gap-4 mb-4">
            <User className="w-12 h-12" style={{ color: 'var(--b1-gold-trim)' }} />
            <h1 className="tracking-[0.2em]" style={{ fontSize: '3rem', fontWeight: 500 }}>
              ACCOUNT OVERVIEW
            </h1>
          </div>
          <p className="text-lg tracking-wide" style={{ color: 'var(--b1-neutral-gray)' }}>
            {user.tier} Member
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* User Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="border p-8"
              style={{ backgroundColor: 'var(--b1-obsidian-panel)', borderColor: 'var(--b1-border-subtle)' }}
            >
              <div className="flex justify-center mb-6">
                <div className="w-24 h-24 rounded-full border flex items-center justify-center" style={{ backgroundColor: 'var(--b1-obsidian)', borderColor: 'var(--b1-gold-trim)' }}>
                  <User className="w-12 h-12" style={{ color: 'var(--b1-gold-trim)' }} />
                </div>
              </div>

              <h2 className="text-center mb-2 tracking-wider" style={{ fontSize: '1.5rem', fontWeight: 500 }}>
                {user.name}
              </h2>
              <div className="text-center mb-6">
                <span className="inline-block px-4 py-1 text-sm tracking-widest" style={{ backgroundColor: 'var(--b1-gold-minimal)', color: 'var(--b1-black-marble)', fontWeight: 500 }}>
                  {user.tier}
                </span>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3" style={{ color: 'var(--b1-neutral-gray)' }}>
                  <Mail className="w-4 h-4" />
                  <span>{user.email}</span>
                </div>
                <div className="flex items-center gap-3" style={{ color: 'var(--b1-neutral-gray)' }}>
                  <Phone className="w-4 h-4" />
                  <span>{user.phone}</span>
                </div>
                <div className="flex items-center gap-3" style={{ color: 'var(--b1-neutral-gray)' }}>
                  <Shield className="w-4 h-4" />
                  <span>Member since {user.memberSince}</span>
                </div>
              </div>

              <button className="w-full mt-6 py-3 border transition-colors tracking-wider" style={{ borderColor: 'var(--b1-border-subtle)' }} onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--b1-gold-trim)'} onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--b1-border-subtle)'}>
                Edit Profile
              </button>
              <button className="w-full mt-3 py-3 border tracking-wider flex items-center justify-center gap-2 transition-all" style={{ borderColor: '#D4504D', color: '#D4504D' }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#D4504D'; e.currentTarget.style.color = 'var(--b1-white-space)'; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#D4504D'; }}>
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </motion.div>

            {/* Reward Points */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="border p-6"
              style={{ backgroundColor: 'var(--b1-obsidian-panel)', borderColor: 'var(--b1-border-subtle)' }}
            >
              <div className="flex items-center gap-3 mb-4">
                <Star className="w-6 h-6" style={{ color: 'var(--b1-gold-trim)' }} />
                <h3 className="tracking-wider" style={{ fontSize: '1.25rem', fontWeight: 500 }}>
                  Reward Points
                </h3>
              </div>

              <div className="text-center mb-4">
                <div className="text-4xl mb-2" style={{ fontWeight: 500, color: 'var(--b1-gold-minimal)' }}>
                  {user.rewardPoints.toLocaleString()}
                </div>
                <div className="text-sm" style={{ color: 'var(--b1-neutral-gray)' }}>
                  {nextTier ? `${nextTier.points - user.rewardPoints} to ${nextTier.tier}` : 'Maximum tier achieved'}
                </div>
              </div>

              {nextTier && (
                <div className="mb-4">
                  <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--b1-obsidian)' }}>
                    <div
                      className="h-full transition-all duration-1000"
                      style={{ width: `${progress}%`, backgroundColor: 'var(--b1-gold-minimal)' }}
                    ></div>
                  </div>
                </div>
              )}

              <div className="space-y-2 text-sm">
                {rewardTiers.map((tier, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-2"
                    style={{
                      borderLeft: tier.current ? '4px solid var(--b1-gold-trim)' : 'none',
                      paddingLeft: tier.current ? '12px' : '16px'
                    }}
                  >
                    <span style={{ color: tier.current ? 'var(--b1-gold-minimal)' : 'var(--b1-neutral-gray)' }}>
                      {tier.tier}
                    </span>
                    <span style={{ color: 'var(--b1-neutral-gray)' }}>
                      {tier.points.toLocaleString()} pts
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Recent Orders */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="border p-8"
              style={{ backgroundColor: 'var(--b1-obsidian-panel)', borderColor: 'var(--b1-border-subtle)' }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="tracking-wider flex items-center gap-3" style={{ fontSize: '1.5rem', fontWeight: 500 }}>
                  <Package className="w-6 h-6" style={{ color: 'var(--b1-gold-trim)' }} />
                  Recent Orders
                </h2>
                <Link to="/menu" className="text-sm hover:underline tracking-wider" style={{ color: 'var(--b1-gold-trim)' }}>
                  Order Again
                </Link>
              </div>

              <div className="space-y-4">
                {recentOrders.map((order, index) => (
                  <Link
                    key={order.id}
                    to={`/orders/${order.id}`}
                    className="block p-6 border transition-colors"
                    style={{ borderColor: 'var(--b1-border-subtle)' }}
                    onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--b1-gold-trim)'}
                    onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--b1-border-subtle)'}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="tracking-wider mb-1" style={{ fontWeight: 500 }}>
                          Order #{order.id}
                        </div>
                        <div className="text-sm" style={{ color: 'var(--b1-neutral-gray)' }}>
                          {order.date}
                        </div>
                      </div>
                      <div className="px-3 py-1 text-sm tracking-wider" style={{ backgroundColor: 'rgba(212, 175, 55, 0.2)', color: 'var(--b1-gold-minimal)' }}>
                        {order.status}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span style={{ color: 'var(--b1-neutral-gray)' }}>
                        {order.items} items
                      </span>
                      <span className="text-lg" style={{ fontWeight: 500, color: 'var(--b1-gold-minimal)' }}>
                        ${order.total.toFixed(2)}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </motion.div>

            {/* Saved Addresses */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="border p-8"
              style={{ backgroundColor: 'var(--b1-obsidian-panel)', borderColor: 'var(--b1-border-subtle)' }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="tracking-wider flex items-center gap-3" style={{ fontSize: '1.5rem', fontWeight: 500 }}>
                  <MapPin className="w-6 h-6" style={{ color: 'var(--b1-gold-trim)' }} />
                  Delivery Addresses
                </h2>
                <button className="text-sm hover:underline tracking-wider" style={{ color: 'var(--b1-gold-trim)' }}>
                  Add New
                </button>
              </div>

              <div className="space-y-4">
                <div className="p-6 border" style={{ borderColor: 'var(--b1-gold-trim)' }}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="tracking-wider mb-1" style={{ fontWeight: 500 }}>
                        Home
                      </div>
                      <div className="text-sm" style={{ color: 'var(--b1-neutral-gray)' }}>
                        123 Downtown Center<br />
                        Los Angeles, CA 90210
                      </div>
                    </div>
                    <div className="px-3 py-1 text-xs tracking-widest" style={{ backgroundColor: 'var(--b1-gold-minimal)', color: 'var(--b1-black-marble)', fontWeight: 500 }}>
                      DEFAULT
                    </div>
                  </div>
                  <div className="flex gap-3 text-sm">
                    <button className="hover:underline" style={{ color: 'var(--b1-gold-trim)' }}>Edit</button>
                    <button className="hover:text-b1-white-space" style={{ color: 'var(--b1-neutral-gray)' }}>Remove</button>
                  </div>
                </div>

                <div className="p-6 border transition-colors" style={{ borderColor: 'var(--b1-border-subtle)' }} onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--b1-gold-trim)'} onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--b1-border-subtle)'}>
                  <div className="mb-3">
                    <div className="tracking-wider mb-1" style={{ fontWeight: 500 }}>
                      Work
                    </div>
                    <div className="text-sm" style={{ color: 'var(--b1-neutral-gray)' }}>
                      456 Business Plaza, Suite 789<br />
                      Los Angeles, CA 90211
                    </div>
                  </div>
                  <div className="flex gap-3 text-sm">
                    <button className="hover:underline" style={{ color: 'var(--b1-gold-trim)' }}>Edit</button>
                    <button className="hover:text-b1-white-space" style={{ color: 'var(--b1-neutral-gray)' }}>Set as Default</button>
                    <button className="hover:text-b1-white-space" style={{ color: 'var(--b1-neutral-gray)' }}>Remove</button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
