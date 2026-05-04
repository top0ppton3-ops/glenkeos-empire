import { useState, useEffect } from "react";
import { Link } from "react-router";
import { ShoppingCart, Search, User, Menu as MenuIcon } from "lucide-react";
import { api } from "../../services/api";
import { Card } from "../../components/core/Card";
import { Button } from "../../components/core/Button";
import { Loader } from "../../components/feedback/Loader";
import { useCart } from "../../contexts/CartContext";
import { toast } from "react-hot-toast";

export function ChicOnChainStore() {
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { addItem, totalItems } = useCart();

  useEffect(() => {
    loadMenu();
  }, []);

  const loadMenu = async () => {
    try {
      const data = await api.menuItems.list({ brand: 'chic-on-chain' });
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
      <div className="min-h-screen bg-gradient-to-br from-emerald-900 to-emerald-950 flex items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 to-emerald-950">
      {/* Header */}
      <header className="bg-emerald-950/80 backdrop-blur-md border-b border-emerald-700 sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-8">
              <Link to="/" className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center text-2xl">
                  🍽️
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-emerald-400">Chic-on-Chain</h1>
                  <p className="text-xs text-emerald-300">Premium Dining</p>
                </div>
              </Link>
              
              <nav className="hidden md:flex items-center gap-6 text-emerald-300">
                <Link to="/chic-on-chain/menu" className="hover:text-emerald-200 font-medium">Menu</Link>
                <Link to="/chic-on-chain/locations" className="hover:text-emerald-200">Locations</Link>
                <Link to="/chic-on-chain/catering" className="hover:text-emerald-200">Catering</Link>
                <Link to="/chic-on-chain/reservations" className="hover:text-emerald-200">Reservations</Link>
              </nav>
            </div>

            <div className="flex items-center gap-4">
              <Link to="/account" className="text-emerald-300 hover:text-emerald-200">
                <User className="w-6 h-6" />
              </Link>
              <Link to="/cart" className="text-emerald-300 hover:text-emerald-200 relative">
                <ShoppingCart className="w-6 h-6" />
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-emerald-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-emerald-900 to-emerald-800 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl font-bold text-emerald-100 mb-4">
              Premium Dining Experience
            </h2>
            <p className="text-emerald-200 mb-8">
              Exquisite cuisine crafted by world-renowned chefs using the finest ingredients
            </p>
            
            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-600 w-5 h-5" />
              <input
                type="text"
                placeholder="Search our menu..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-emerald-700 bg-emerald-950/50 text-emerald-100 placeholder-emerald-500 focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="container mx-auto px-4 py-12">
        {categories.map(category => {
          const categoryItems = filteredItems.filter(item => item.category === category);
          if (categoryItems.length === 0) return null;

          return (
            <div key={category} className="mb-12">
              <h3 className="text-3xl font-bold text-emerald-400 mb-6">{category}</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categoryItems.map(item => (
                  <Card key={item.id} className="bg-emerald-950/50 border-emerald-700 hover:border-emerald-500 transition-all overflow-hidden group">
                    <div className="aspect-video overflow-hidden">
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="text-xl font-bold text-emerald-300">{item.name}</h4>
                        <span className="text-emerald-400 font-bold text-lg">
                          ${(item.price / 100).toFixed(2)}
                        </span>
                      </div>
                      <p className="text-emerald-200 text-sm mb-4">{item.description}</p>
                      <Button
                        onClick={() => addToCart(item)}
                        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white"
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
      <footer className="bg-emerald-950/80 border-t border-emerald-700 py-8">
        <div className="container mx-auto px-4 text-center text-emerald-400">
          <p>© 2026 Chic-on-Chain. A GlenKeos Brand.</p>
        </div>
      </footer>
    </div>
  );
}