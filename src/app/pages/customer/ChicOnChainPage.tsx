import React, { useState, useEffect } from 'react';
import { useCart } from '../../contexts/CartContext';
import { Wine, UtensilsCrossed, Calendar, MapPin } from 'lucide-react';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  category: string;
  image_url?: string;
  dietary_tags?: string[];
}

export default function ChicOnChainPage() {
  const { addToCart, cart } = useCart();
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('appetizers');

  const categories = ['appetizers', 'entrees', 'desserts', 'wine', 'cocktails'];

  useEffect(() => {
    loadMenu();
  }, []);

  const loadMenu = async () => {
    setLoading(true);
    try {
      // Mock premium restaurant menu
      const mockMenu: MenuItem[] = [
        {
          id: 'a1',
          name: 'Truffle Burrata',
          description: 'Fresh burrata, black truffle oil, microgreens, crostini',
          price: 24.99,
          currency: 'USD',
          category: 'appetizers',
          dietary_tags: ['vegetarian'],
        },
        {
          id: 'a2',
          name: 'Wagyu Beef Tartare',
          description: 'Hand-cut wagyu, quail egg, capers, shallots, brioche',
          price: 32.99,
          currency: 'USD',
          category: 'appetizers',
        },
        {
          id: 'a3',
          name: 'Oysters Rockefeller',
          description: 'Six fresh oysters, spinach, pernod, parmesan crust',
          price: 28.99,
          currency: 'USD',
          category: 'appetizers',
        },
        {
          id: 'e1',
          name: 'Dry-Aged Ribeye',
          description: '45-day aged 16oz ribeye, truffle potato gratin, asparagus',
          price: 89.99,
          currency: 'USD',
          category: 'entrees',
        },
        {
          id: 'e2',
          name: 'Pan-Seared Halibut',
          description: 'Wild halibut, lemon beurre blanc, seasonal vegetables',
          price: 54.99,
          currency: 'USD',
          category: 'entrees',
        },
        {
          id: 'e3',
          name: 'Duck Confit',
          description: 'Crispy duck leg, cherry gastrique, fingerling potatoes',
          price: 46.99,
          currency: 'USD',
          category: 'entrees',
        },
        {
          id: 'd1',
          name: 'Crème Brûlée',
          description: 'Classic vanilla bean, caramelized sugar, fresh berries',
          price: 14.99,
          currency: 'USD',
          category: 'desserts',
        },
        {
          id: 'd2',
          name: 'Chocolate Soufflé',
          description: 'Dark chocolate soufflé, vanilla ice cream (15min wait)',
          price: 16.99,
          currency: 'USD',
          category: 'desserts',
        },
        {
          id: 'w1',
          name: 'Château Margaux 2015',
          description: 'Bordeaux, France - Full-bodied, elegant tannins',
          price: 450.00,
          currency: 'USD',
          category: 'wine',
        },
        {
          id: 'w2',
          name: 'Opus One 2018',
          description: 'Napa Valley - Cabernet blend, rich and complex',
          price: 380.00,
          currency: 'USD',
          category: 'wine',
        },
        {
          id: 'c1',
          name: 'Old Fashioned',
          description: 'Bourbon, bitters, orange, cherry',
          price: 18.00,
          currency: 'USD',
          category: 'cocktails',
        },
        {
          id: 'c2',
          name: 'French 75',
          description: 'Gin, lemon, champagne, sugar',
          price: 19.00,
          currency: 'USD',
          category: 'cocktails',
        },
      ];

      setMenu(mockMenu);
    } catch (error) {
      console.error('Failed to load menu:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (item: MenuItem) => {
    addToCart({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: 1,
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-900 to-purple-800 text-white p-12 rounded-lg">
        <div className="flex items-center gap-4 mb-4">
          <UtensilsCrossed className="w-12 h-12" />
          <div>
            <h1 className="text-5xl font-serif mb-2">Chic-on-Chain</h1>
            <p className="text-purple-200 text-lg">Premium dining experience</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="flex items-center gap-3">
            <Calendar className="w-6 h-6 text-purple-300" />
            <div>
              <p className="text-sm text-purple-300">Reservations</p>
              <p className="font-medium">Available for private events</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Wine className="w-6 h-6 text-purple-300" />
            <div>
              <p className="text-sm text-purple-300">Wine List</p>
              <p className="font-medium">200+ curated selections</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <MapPin className="w-6 h-6 text-purple-300" />
            <div>
              <p className="text-sm text-purple-300">Location</p>
              <p className="font-medium">Downtown & Airport locations</p>
            </div>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex space-x-4 border-b border-gray-200">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`pb-4 px-4 font-medium transition capitalize ${
              selectedCategory === category
                ? 'border-b-2 border-purple-600 text-purple-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Menu Items */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {menu
          .filter((item) => item.category === selectedCategory)
          .map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition"
            >
              {/* Item Image Placeholder */}
              <div className="h-48 bg-gradient-to-br from-purple-100 to-purple-50 flex items-center justify-center">
                <UtensilsCrossed className="w-16 h-16 text-purple-300" />
              </div>

              {/* Item Details */}
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-serif font-bold text-xl">{item.name}</h3>
                  <span className="font-bold text-purple-600">
                    ${item.price.toFixed(2)}
                  </span>
                </div>

                <p className="text-gray-600 text-sm mb-4">{item.description}</p>

                {/* Dietary Tags */}
                {item.dietary_tags && item.dietary_tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {item.dietary_tags.map((tag) => (
                      <span
                        key={tag}
                        className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Add to Order Button */}
                <button
                  onClick={() => handleAddToCart(item)}
                  className="w-full py-2 px-4 rounded-lg font-medium transition bg-purple-600 text-white hover:bg-purple-700"
                >
                  Add to Order
                </button>
              </div>
            </div>
          ))}
      </div>

      {/* Cart Summary */}
      {cart.items.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg md:relative md:shadow-none">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div>
              <p className="font-medium">
                {cart.items.length} item{cart.items.length !== 1 ? 's' : ''} in order
              </p>
              <p className="text-sm text-gray-600">
                Subtotal: ${cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)}
              </p>
            </div>
            <button className="bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition">
              Place Order
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
