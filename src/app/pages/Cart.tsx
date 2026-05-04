import { motion } from "motion/react";
import { Link } from "react-router";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { ShoppingCart, Plus, Minus, Trash2, ArrowRight, Crown } from "lucide-react";
import { useState } from "react";

export function Cart() {
  const [cartItems, setCartItems] = useState([
    {
      id: "1",
      itemId: "ares-flame-burger",
      name: "Ares Flame Burger",
      deity: "Ares",
      price: 18.99,
      quantity: 2,
      image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80",
      options: ["Extra Patty", "Add Bacon"]
    },
    {
      id: "2",
      itemId: "athena-wisdom-bowl",
      name: "Athena Wisdom Bowl",
      deity: "Athena",
      price: 16.99,
      quantity: 1,
      image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80",
      options: []
    },
    {
      id: "3",
      itemId: "apollo-golden-chicken",
      name: "Apollo's Golden Roast",
      deity: "Apollo",
      price: 22.99,
      quantity: 1,
      image: "https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=400&q=80",
      options: ["Side of Fries"]
    }
  ]);

  const updateQuantity = (id: string, delta: number) => {
    setCartItems(items =>
      items.map(item =>
        item.id === id
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item
      )
    );
  };

  const removeItem = (id: string) => {
    setCartItems(items => items.filter(item => item.id !== id));
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.08;
  const deliveryFee = 4.99;
  const total = subtotal + tax + deliveryFee;

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
            <ShoppingCart className="w-12 h-12 text-apollo-gold" />
            <h1 className="tracking-[0.2em]" style={{ fontSize: '3rem', fontWeight: 700 }}>
              YOUR CART
            </h1>
          </div>
          <p className="text-lg text-muted-foreground tracking-wide">
            {cartItems.length} offerings ready for divine delivery
          </p>
        </motion.div>

        {cartItems.length === 0 ? (
          <div className="text-center py-20">
            <ShoppingCart className="w-24 h-24 text-muted-foreground/30 mx-auto mb-6" />
            <h2 className="mb-4 tracking-wider" style={{ fontSize: '2rem', fontWeight: 600 }}>
              Your Cart is Empty
            </h2>
            <p className="text-muted-foreground mb-8">
              The gods await your order
            </p>
            <Link
              to="/menu"
              className="inline-block px-10 py-3 bg-apollo-gold text-hades-black tracking-wider hover:bg-king-gold transition-all"
              style={{ fontWeight: 600 }}
            >
              EXPLORE PANTHEON
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-6">
              {cartItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-background border-2 border-border p-6"
                >
                  <div className="flex gap-6">
                    {/* Image */}
                    <Link to={`/menu/${item.itemId}`} className="flex-shrink-0">
                      <ImageWithFallback
                        src={item.image}
                        alt={item.name}
                        className="w-32 h-32 object-cover border-2 border-king-gold/30 hover:border-apollo-gold transition-colors"
                      />
                    </Link>

                    {/* Details */}
                    <div className="flex-1 flex flex-col">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <Link
                            to={`/menu/${item.itemId}`}
                            className="hover:text-apollo-gold transition-colors"
                          >
                            <h3 className="tracking-wider mb-1" style={{ fontSize: '1.5rem', fontWeight: 600 }}>
                              {item.name}
                            </h3>
                          </Link>
                          <div className="text-sm text-apollo-gold tracking-wider">
                            {item.deity}
                          </div>
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-muted-foreground hover:text-ares-red transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>

                      {item.options.length > 0 && (
                        <div className="mb-4 text-sm text-muted-foreground">
                          {item.options.join(", ")}
                        </div>
                      )}

                      <div className="mt-auto flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <button
                            onClick={() => updateQuantity(item.id, -1)}
                            className="w-8 h-8 border border-border hover:border-apollo-gold flex items-center justify-center transition-colors"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="text-lg w-8 text-center" style={{ fontWeight: 600 }}>
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, 1)}
                            className="w-8 h-8 border border-border hover:border-apollo-gold flex items-center justify-center transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="text-2xl text-king-gold" style={{ fontWeight: 600 }}>
                          ${(item.price * item.quantity).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
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

                <div className="space-y-4 mb-6 pb-6 border-b border-border">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span style={{ fontWeight: 600 }}>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tax</span>
                    <span style={{ fontWeight: 600 }}>${tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Delivery Fee</span>
                    <span style={{ fontWeight: 600 }}>${deliveryFee.toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex justify-between mb-8 text-xl">
                  <span style={{ fontWeight: 600 }}>Total</span>
                  <span className="text-apollo-gold" style={{ fontWeight: 700 }}>
                    ${total.toFixed(2)}
                  </span>
                </div>

                <Link
                  to="/checkout"
                  className="w-full py-4 bg-apollo-gold text-hades-black tracking-wider hover:bg-king-gold transition-all transform hover:scale-105 flex items-center justify-center gap-3"
                  style={{ fontWeight: 600 }}
                >
                  PROCEED TO CHECKOUT
                  <ArrowRight className="w-5 h-5" />
                </Link>

                <Link
                  to="/menu"
                  className="block w-full mt-4 py-3 border-2 border-border text-center tracking-wider hover:border-apollo-gold transition-colors"
                >
                  Continue Shopping
                </Link>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
