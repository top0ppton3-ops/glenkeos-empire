import { Link, useNavigate } from "react-router";
import { Trash2, Plus, Minus, ShoppingCart, ArrowLeft } from "lucide-react";
import { useCart } from "../contexts/CartContext";
import { Card } from "../components/core/Card";
import { Button } from "../components/core/Button";

export function CartPage() {
  const { items, removeItem, updateQuantity, totalPrice, totalItems, clearCart } = useCart();
  const navigate = useNavigate();

  const getBrandColor = (brand: string) => {
    switch (brand) {
      case 'chic-on-chain': return { bg: 'from-emerald-900 to-emerald-950', border: 'border-emerald-700', text: 'text-emerald-400', button: 'bg-emerald-600 hover:bg-emerald-500' };
      case 'ghetto-eats': return { bg: 'from-blue-900 to-blue-950', border: 'border-blue-700', text: 'text-blue-400', button: 'bg-blue-600 hover:bg-blue-500' };
      case 'goldkey': return { bg: 'from-black to-zinc-900', border: 'border-amber-600', text: 'text-amber-400', button: 'bg-amber-600 hover:bg-amber-500' };
      default: return { bg: 'from-slate-900 to-slate-950', border: 'border-slate-700', text: 'text-slate-400', button: 'bg-slate-600 hover:bg-slate-500' };
    }
  };

  const primaryBrand = items[0]?.brand || 'chic-on-chain';
  const colors = getBrandColor(primaryBrand);

  if (items.length === 0) {
    return (
      <div className={`min-h-screen bg-gradient-to-br ${colors.bg}`}>
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto text-center">
            <div className={`w-32 h-32 mx-auto mb-8 rounded-full ${colors.border} border-4 flex items-center justify-center`}>
              <ShoppingCart className={`w-16 h-16 ${colors.text}`} />
            </div>
            <h1 className={`text-4xl font-bold ${colors.text} mb-4`}>Your cart is empty</h1>
            <p className="text-slate-300 mb-8">Add some items to get started</p>
            <Link to="/">
              <Button className={colors.button}>
                Browse Brands
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br ${colors.bg}`}>
      {/* Header */}
      <header className={`bg-black/50 backdrop-blur-md border-b ${colors.border}`}>
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <button onClick={() => navigate(-1)} className={`flex items-center gap-2 ${colors.text} hover:opacity-80`}>
              <ArrowLeft className="w-5 h-5" />
              Continue Shopping
            </button>
            <h1 className={`text-2xl font-bold ${colors.text}`}>Shopping Cart</h1>
            <div className={`${colors.text}`}>{totalItems} items</div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <Card key={item.id} className={`bg-black/30 ${colors.border} overflow-hidden`}>
                <div className="flex gap-4 p-4">
                  {item.image_url && (
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-32 h-32 object-cover rounded-lg"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className={`text-lg font-bold ${colors.text} mb-2`}>{item.name}</h3>
                    <p className="text-slate-400 text-sm mb-4 line-clamp-2">{item.description}</p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className={`p-2 rounded-lg ${colors.button}`}
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className={`w-12 text-center font-bold ${colors.text}`}>
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className={`p-2 rounded-lg ${colors.button}`}
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <span className={`text-xl font-bold ${colors.text}`}>
                          ${((item.price * item.quantity) / 100).toLocaleString()}
                        </span>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
            
            <button
              onClick={clearCart}
              className="text-red-500 hover:text-red-400 text-sm flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Clear Cart
            </button>
          </div>

          {/* Order Summary */}
          <div>
            <Card className={`bg-black/30 ${colors.border} sticky top-4`}>
              <div className="p-6">
                <h2 className={`text-2xl font-bold ${colors.text} mb-6`}>Order Summary</h2>
                
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-slate-300">
                    <span>Subtotal</span>
                    <span>${(totalPrice / 100).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Tax (estimated)</span>
                    <span>${((totalPrice * 0.0875) / 100).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Delivery Fee</span>
                    <span>{totalPrice > 2500 ? 'FREE' : '$4.99'}</span>
                  </div>
                  
                  <div className={`h-px bg-gradient-to-r ${colors.border}`} />
                  
                  <div className={`flex justify-between text-xl font-bold ${colors.text}`}>
                    <span>Total</span>
                    <span>
                      ${(
                        (totalPrice + (totalPrice * 0.0875) + (totalPrice > 2500 ? 0 : 499)) / 100
                      ).toLocaleString()}
                    </span>
                  </div>
                </div>

                <Link to="/checkout">
                  <Button className={`w-full ${colors.button} text-white font-bold py-4`}>
                    Proceed to Checkout
                  </Button>
                </Link>

                <p className="text-xs text-slate-400 text-center mt-4">
                  Secure checkout powered by PayPal
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
