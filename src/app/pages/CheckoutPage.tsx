import { useState } from "react";
import { useNavigate } from "react-router";
import { CreditCard, Lock, ArrowLeft, Check } from "lucide-react";
import { useCart } from "../contexts/CartContext";
import { useAuth } from "../contexts/AuthContext";
import { api } from "../services/api";
import { Card } from "../components/core/Card";
import { Button } from "../components/core/Button";
import { toast } from "react-hot-toast";

export function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: user?.email || "",
    name: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    cardNumber: "",
    expiry: "",
    cvv: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Calculate order totals
      const tax = totalPrice * 0.0875;
      const deliveryFee = totalPrice > 2500 ? 0 : 499;
      const finalTotal = totalPrice + tax + deliveryFee;

      // Create order in Supabase
      const orderData = {
        customer_id: user?.id || `guest-${Date.now()}`,
        tenant_id: items[0]?.brand || "chic-on-chain",
        total_amount: finalTotal,
        tax_amount: tax,
        delivery_fee: deliveryFee,
        status: "PENDING",
        delivery_address: {
          street: formData.address,
          city: formData.city,
          state: formData.state,
          zip: formData.zip,
        },
        customer_info: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
        },
        items: items.map(item => ({
          item_id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        })),
      };

      console.log('Creating order with data:', orderData);
      const order = await api.orders.create(orderData);
      console.log('Order created:', order);

      if (!order || !order.id) {
        throw new Error('Order creation failed - no order ID returned');
      }

      // TODO: Integrate PayPal payment processing
      // For now, mark order as confirmed
      await api.orders.updateStatus(order.id, 'CONFIRMED');

      toast.success(`Order #${order.id.substring(0, 8)} placed successfully!`);

      clearCart();
      navigate(`/customer/orders/${order.id}`);

    } catch (error) {
      console.error("Checkout error:", error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error(`Failed to place order: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const primaryBrand = items[0]?.brand || 'chic-on-chain';
  const getBrandColor = (brand: string) => {
    switch (brand) {
      case 'chic-on-chain': return { bg: 'from-emerald-900 to-emerald-950', border: 'border-emerald-700', text: 'text-emerald-400', button: 'bg-emerald-600 hover:bg-emerald-500' };
      case 'ghetto-eats': return { bg: 'from-blue-900 to-blue-950', border: 'border-blue-700', text: 'text-blue-400', button: 'bg-blue-600 hover:bg-blue-500' };
      case 'goldkey': return { bg: 'from-black to-zinc-900', border: 'border-amber-600', text: 'text-amber-400', button: 'bg-amber-600 hover:bg-amber-500' };
      default: return { bg: 'from-slate-900 to-slate-950', border: 'border-slate-700', text: 'text-slate-400', button: 'bg-slate-600 hover:bg-slate-500' };
    }
  };
  const colors = getBrandColor(primaryBrand);

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  const tax = totalPrice * 0.0875;
  const deliveryFee = totalPrice > 2500 ? 0 : 499;
  const total = totalPrice + tax + deliveryFee;

  return (
    <div className={`min-h-screen bg-gradient-to-br ${colors.bg}`}>
      {/* Header */}
      <header className={`bg-black/50 backdrop-blur-md border-b ${colors.border}`}>
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <button onClick={() => navigate(-1)} className={`flex items-center gap-2 ${colors.text} hover:opacity-80`}>
              <ArrowLeft className="w-5 h-5" />
              Back to Cart
            </button>
            <h1 className={`text-2xl font-bold ${colors.text}`}>Secure Checkout</h1>
            <div className="flex items-center gap-2 text-green-500">
              <Lock className="w-4 h-4" />
              <span className="text-sm">Secure</span>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-8">
          {/* Forms */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact Information */}
            <Card className={`bg-black/30 ${colors.border} p-6`}>
              <h2 className={`text-xl font-bold ${colors.text} mb-6`}>Contact Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-slate-300 mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg bg-black/50 border border-slate-700 text-white focus:border-blue-500 focus:outline-none"
                    placeholder="your@email.com"
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-300 mb-2">Full Name</label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-lg bg-black/50 border border-slate-700 text-white focus:border-blue-500 focus:outline-none"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 mb-2">Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-lg bg-black/50 border border-slate-700 text-white focus:border-blue-500 focus:outline-none"
                      placeholder="(555) 123-4567"
                    />
                  </div>
                </div>
              </div>
            </Card>

            {/* Delivery Address */}
            <Card className={`bg-black/30 ${colors.border} p-6`}>
              <h2 className={`text-xl font-bold ${colors.text} mb-6`}>Delivery Address</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-slate-300 mb-2">Street Address</label>
                  <input
                    type="text"
                    name="address"
                    required
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg bg-black/50 border border-slate-700 text-white focus:border-blue-500 focus:outline-none"
                    placeholder="123 Main St, Apt 4B"
                  />
                </div>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-slate-300 mb-2">City</label>
                    <input
                      type="text"
                      name="city"
                      required
                      value={formData.city}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-lg bg-black/50 border border-slate-700 text-white focus:border-blue-500 focus:outline-none"
                      placeholder="New York"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 mb-2">State</label>
                    <input
                      type="text"
                      name="state"
                      required
                      value={formData.state}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-lg bg-black/50 border border-slate-700 text-white focus:border-blue-500 focus:outline-none"
                      placeholder="NY"
                      maxLength={2}
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 mb-2">ZIP Code</label>
                    <input
                      type="text"
                      name="zip"
                      required
                      value={formData.zip}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-lg bg-black/50 border border-slate-700 text-white focus:border-blue-500 focus:outline-none"
                      placeholder="10001"
                      maxLength={5}
                    />
                  </div>
                </div>
              </div>
            </Card>

            {/* Payment Method */}
            <Card className={`bg-black/30 ${colors.border} p-6`}>
              <h2 className={`text-xl font-bold ${colors.text} mb-6 flex items-center gap-2`}>
                <CreditCard className="w-6 h-6" />
                Payment Method
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-slate-300 mb-2">Card Number</label>
                  <input
                    type="text"
                    name="cardNumber"
                    required
                    value={formData.cardNumber}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg bg-black/50 border border-slate-700 text-white focus:border-blue-500 focus:outline-none"
                    placeholder="1234 5678 9012 3456"
                    maxLength={19}
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-300 mb-2">Expiry Date</label>
                    <input
                      type="text"
                      name="expiry"
                      required
                      value={formData.expiry}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-lg bg-black/50 border border-slate-700 text-white focus:border-blue-500 focus:outline-none"
                      placeholder="MM/YY"
                      maxLength={5}
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 mb-2">CVV</label>
                    <input
                      type="text"
                      name="cvv"
                      required
                      value={formData.cvv}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-lg bg-black/50 border border-slate-700 text-white focus:border-blue-500 focus:outline-none"
                      placeholder="123"
                      maxLength={4}
                    />
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Order Summary */}
          <div>
            <Card className={`bg-black/30 ${colors.border} sticky top-4 p-6`}>
              <h2 className={`text-2xl font-bold ${colors.text} mb-6`}>Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                {items.map(item => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-slate-300">
                      {item.name} x{item.quantity}
                    </span>
                    <span className={colors.text}>
                      ${((item.price * item.quantity) / 100).toFixed(2)}
                    </span>
                  </div>
                ))}
                
                <div className={`h-px bg-gradient-to-r ${colors.border}`} />
                
                <div className="flex justify-between text-slate-300">
                  <span>Subtotal</span>
                  <span>${(totalPrice / 100).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Tax</span>
                  <span>${(tax / 100).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Delivery</span>
                  <span>{deliveryFee === 0 ? 'FREE' : `$${(deliveryFee / 100).toFixed(2)}`}</span>
                </div>
                
                <div className={`h-px bg-gradient-to-r ${colors.border}`} />
                
                <div className={`flex justify-between text-xl font-bold ${colors.text}`}>
                  <span>Total</span>
                  <span>${(total / 100).toFixed(2)}</span>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className={`w-full ${colors.button} text-white font-bold py-4 flex items-center justify-center gap-2`}
              >
                {loading ? (
                  <>Processing...</>
                ) : (
                  <>
                    <Check className="w-5 h-5" />
                    Place Order
                  </>
                )}
              </Button>

              <p className="text-xs text-slate-400 text-center mt-4">
                By placing this order, you agree to our Terms of Service and Privacy Policy
              </p>
            </Card>
          </div>
        </form>
      </div>
    </div>
  );
}
