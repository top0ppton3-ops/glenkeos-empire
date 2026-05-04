import { motion } from "motion/react";
import { useNavigate } from "react-router";
import { Shield, CreditCard, MapPin, Clock, Crown } from "lucide-react";
import { useState } from "react";

export function Checkout() {
  const navigate = useNavigate();
  const [deliveryTime, setDeliveryTime] = useState("asap");

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    // In real app, process payment and create order
    navigate('/orders/ORD-2026-001');
  };

  return (
    <div className="min-h-screen bg-card py-12 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-12"
        >
          <div className="flex items-center gap-4 mb-4">
            <Shield className="w-12 h-12 text-apollo-gold" />
            <h1 className="tracking-[0.2em]" style={{ fontSize: '3rem', fontWeight: 700 }}>
              CHECKOUT
            </h1>
          </div>
          <p className="text-lg text-muted-foreground tracking-wide">
            Complete your divine offering
          </p>
        </motion.div>

        <form onSubmit={handlePlaceOrder}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form */}
            <div className="lg:col-span-2 space-y-8">
              {/* Delivery Info */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="bg-background border-2 border-border p-8"
              >
                <div className="flex items-center gap-3 mb-6">
                  <MapPin className="w-6 h-6 text-apollo-gold" />
                  <h2 className="tracking-wider" style={{ fontSize: '1.5rem', fontWeight: 600 }}>
                    Delivery Address
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="First Name"
                    required
                    className="px-4 py-3 bg-card border-2 border-border focus:border-apollo-gold outline-none transition-colors"
                  />
                  <input
                    type="text"
                    placeholder="Last Name"
                    required
                    className="px-4 py-3 bg-card border-2 border-border focus:border-apollo-gold outline-none transition-colors"
                  />
                  <input
                    type="text"
                    placeholder="Street Address"
                    required
                    className="md:col-span-2 px-4 py-3 bg-card border-2 border-border focus:border-apollo-gold outline-none transition-colors"
                  />
                  <input
                    type="text"
                    placeholder="Apartment, Suite, etc."
                    className="md:col-span-2 px-4 py-3 bg-card border-2 border-border focus:border-apollo-gold outline-none transition-colors"
                  />
                  <input
                    type="text"
                    placeholder="City"
                    required
                    className="px-4 py-3 bg-card border-2 border-border focus:border-apollo-gold outline-none transition-colors"
                  />
                  <input
                    type="text"
                    placeholder="ZIP Code"
                    required
                    className="px-4 py-3 bg-card border-2 border-border focus:border-apollo-gold outline-none transition-colors"
                  />
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    required
                    className="md:col-span-2 px-4 py-3 bg-card border-2 border-border focus:border-apollo-gold outline-none transition-colors"
                  />
                </div>
              </motion.div>

              {/* Delivery Time */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="bg-background border-2 border-border p-8"
              >
                <div className="flex items-center gap-3 mb-6">
                  <Clock className="w-6 h-6 text-apollo-gold" />
                  <h2 className="tracking-wider" style={{ fontSize: '1.5rem', fontWeight: 600 }}>
                    Delivery Time
                  </h2>
                </div>

                <div className="space-y-3">
                  <label className="flex items-center gap-3 p-4 border-2 border-border cursor-pointer hover:border-apollo-gold transition-colors">
                    <input
                      type="radio"
                      name="deliveryTime"
                      value="asap"
                      checked={deliveryTime === "asap"}
                      onChange={(e) => setDeliveryTime(e.target.value)}
                      className="w-5 h-5 accent-apollo-gold"
                    />
                    <div>
                      <div style={{ fontWeight: 600 }}>As soon as possible</div>
                      <div className="text-sm text-muted-foreground">30-45 minutes</div>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 p-4 border-2 border-border cursor-pointer hover:border-apollo-gold transition-colors">
                    <input
                      type="radio"
                      name="deliveryTime"
                      value="scheduled"
                      checked={deliveryTime === "scheduled"}
                      onChange={(e) => setDeliveryTime(e.target.value)}
                      className="w-5 h-5 accent-apollo-gold"
                    />
                    <div>
                      <div style={{ fontWeight: 600 }}>Schedule for later</div>
                      <div className="text-sm text-muted-foreground">Choose your time</div>
                    </div>
                  </label>
                </div>

                {deliveryTime === "scheduled" && (
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <input
                      type="date"
                      className="px-4 py-3 bg-card border-2 border-border focus:border-apollo-gold outline-none transition-colors"
                    />
                    <input
                      type="time"
                      className="px-4 py-3 bg-card border-2 border-border focus:border-apollo-gold outline-none transition-colors"
                    />
                  </div>
                )}
              </motion.div>

              {/* Payment */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="bg-background border-2 border-border p-8"
              >
                <div className="flex items-center gap-3 mb-6">
                  <CreditCard className="w-6 h-6 text-apollo-gold" />
                  <h2 className="tracking-wider" style={{ fontSize: '1.5rem', fontWeight: 600 }}>
                    Payment Method
                  </h2>
                </div>

                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Card Number"
                    required
                    className="w-full px-4 py-3 bg-card border-2 border-border focus:border-apollo-gold outline-none transition-colors"
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="MM/YY"
                      required
                      className="px-4 py-3 bg-card border-2 border-border focus:border-apollo-gold outline-none transition-colors"
                    />
                    <input
                      type="text"
                      placeholder="CVV"
                      required
                      className="px-4 py-3 bg-card border-2 border-border focus:border-apollo-gold outline-none transition-colors"
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="Cardholder Name"
                    required
                    className="w-full px-4 py-3 bg-card border-2 border-border focus:border-apollo-gold outline-none transition-colors"
                  />
                </div>
              </motion.div>
            </div>

            {/* Order Summary */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="lg:col-span-1"
            >
              <div className="bg-background border-2 border-king-gold/30 p-8 sticky top-24">
                <div className="flex items-center gap-3 mb-6">
                  <Crown className="w-6 h-6 text-apollo-gold" />
                  <h2 className="tracking-wider" style={{ fontSize: '1.5rem', fontWeight: 600 }}>
                    Order Summary
                  </h2>
                </div>

                <div className="space-y-3 mb-6 pb-6 border-b border-border text-sm">
                  <div className="flex justify-between">
                    <span>2× Ares Flame Burger</span>
                    <span>$37.98</span>
                  </div>
                  <div className="flex justify-between">
                    <span>1× Athena Wisdom Bowl</span>
                    <span>$16.99</span>
                  </div>
                  <div className="flex justify-between">
                    <span>1× Apollo's Golden Roast</span>
                    <span>$22.99</span>
                  </div>
                </div>

                <div className="space-y-3 mb-6 pb-6 border-b border-border">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span style={{ fontWeight: 600 }}>$77.96</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tax</span>
                    <span style={{ fontWeight: 600 }}>$6.24</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Delivery</span>
                    <span style={{ fontWeight: 600 }}>$4.99</span>
                  </div>
                </div>

                <div className="flex justify-between mb-8 text-xl">
                  <span style={{ fontWeight: 600 }}>Total</span>
                  <span className="text-apollo-gold" style={{ fontWeight: 700 }}>
                    $89.19
                  </span>
                </div>

                <button
                  type="submit"
                  className="w-full py-4 bg-apollo-gold text-hades-black tracking-wider hover:bg-king-gold transition-all transform hover:scale-105"
                  style={{ fontWeight: 600 }}
                >
                  PLACE ORDER
                </button>

                <p className="mt-6 text-xs text-center text-muted-foreground">
                  By placing this order, you accept the divine covenant of GlenKeos
                </p>
              </div>
            </motion.div>
          </div>
        </form>
      </div>
    </div>
  );
}
