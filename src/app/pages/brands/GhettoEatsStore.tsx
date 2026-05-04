import { useState, useEffect } from "react";
import { Link } from "react-router";
import { ShoppingCart, Search, User, MapPin, Clock } from "lucide-react";
import { api } from "../../services/api";
import { Card } from "../../components/core/Card";
import { Button } from "../../components/core/Button";
import { Loader } from "../../components/feedback/Loader";
import { useCart } from "../../contexts/CartContext";
import { toast } from "react-hot-toast";

export function GhettoEatsStore() {
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { addItem, totalItems } = useCart();

  useEffect(() => {
    loadMenu();
  }, []);

  const loadMenu = async () => {
    try {
      const data = await api.menuItems.list({ brand: 'ghetto-eats' });
      setMenuItems(data.items || []);
    } catch (error) {
      console.error('Failed to load menu:', error);
      toast.error('Failed to load menu. Please try again.');
      setMenuItems([]);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (item: any) => {
    addItem(item);
    toast.success(`${item.name} added to cart!`);
  };

  const filteredItems = menuItems.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const categories = Array.from(new Set(menuItems.map(item => item.category)));

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-950 flex items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-950">
      {/* Header */}
      <header className="bg-blue-950/80 backdrop-blur-md border-b border-blue-700 sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-8">
              <Link to="/" className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-2xl">
                  🚚
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-blue-400">Ghetto Eats</h1>
                  <p className="text-xs text-blue-300">Fast Delivery</p>
                </div>
              </Link>
              
              <nav className="hidden md:flex items-center gap-6 text-blue-300">
                <Link to="/ghetto-eats/menu" className="hover:text-blue-200 font-medium">Menu</Link>
                <Link to="/ghetto-eats/deals" className="hover:text-blue-200">Deals</Link>
                <Link to="/ghetto-eats/track" className="hover:text-blue-200">Track Order</Link>
              </nav>
            </div>

            <div className="flex items-center gap-4">
              <Link to="/account" className="text-blue-300 hover:text-blue-200">
                <User className="w-6 h-6" />
              </Link>
              <Link to="/cart" className="text-blue-300 hover:text-blue-200 relative">
                <ShoppingCart className="w-6 h-6" />
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Delivery Info Banner */}
      <div className="bg-blue-600 py-3">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-6 text-white text-sm">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span>Delivering to Downtown</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span className="font-bold">25-35 min</span>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-800 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl font-bold text-blue-100 mb-4">
              Fast Food, Faster Delivery 🔥
            </h2>
            <p className="text-blue-200 mb-8">
              Street food favorites delivered to your door in under 30 minutes
            </p>
            
            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-600 w-5 h-5" />
              <input
                type="text"
                placeholder="What are you craving?"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-blue-700 bg-blue-950/50 text-blue-100 placeholder-blue-500 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Popular Deals */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid md:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-r from-orange-600 to-orange-700 border-orange-500 p-4 text-white">
            <h3 className="font-bold text-lg mb-1">🔥 HOT DEAL</h3>
            <p className="text-sm">2 Burgers + Fries - $19.99</p>
          </Card>
          <Card className="bg-gradient-to-r from-purple-600 to-purple-700 border-purple-500 p-4 text-white">
            <h3 className="font-bold text-lg mb-1">⚡ FLASH SALE</h3>
            <p className="text-sm">Free Delivery - Orders over $25</p>
          </Card>
          <Card className="bg-gradient-to-r from-green-600 to-green-700 border-green-500 p-4 text-white">
            <h3 className="font-bold text-lg mb-1">💚 NEW</h3>
            <p className="text-sm">Nashville Hot Chicken - Try Now!</p>
          </Card>
        </div>
      </div>

      {/* Menu Items */}
      <div className="container mx-auto px-4 py-8">
        {categories.map(category => {
          const categoryItems = filteredItems.filter(item => item.category === category);
          if (categoryItems.length === 0) return null;

          return (
            <div key={category} className="mb-12">
              <h3 className="text-3xl font-bold text-blue-400 mb-6">{category}</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categoryItems.map(item => (
                  <Card key={item.id} className="bg-blue-950/50 border-blue-700 hover:border-blue-500 transition-all overflow-hidden group">
                    <div className="aspect-video overflow-hidden relative">
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute top-2 right-2 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {item.prep_time}
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="text-xl font-bold text-blue-300">{item.name}</h4>
                        <span className="text-blue-400 font-bold text-lg">
                          ${(item.price / 100).toFixed(2)}
                        </span>
                      </div>
                      <p className="text-blue-200 text-sm mb-4">{item.description}</p>
                      <Button
                        onClick={() => addToCart(item)}
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white"
                      >
                        Add to Cart
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <footer className="bg-blue-950/80 border-t border-blue-700 py-8">
        <div className="container mx-auto px-4 text-center text-blue-400">
          <p>© 2026 Ghetto Eats. A GlenKeos Brand.</p>
        </div>
      </footer>
    </div>
  );
}