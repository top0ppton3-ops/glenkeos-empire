import React, { useState, useEffect } from 'react';
import { useCart } from '../../contexts/CartContext';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  active: boolean;
  sold_out: boolean;
  visible_from: string;
  visible_to: string;
  tags: string[];
  image_url?: string;
}

interface MenuCategory {
  id: string;
  name: string;
  items: MenuItem[];
}

export default function GhettoEatsPage() {
  const { addToCart, cart } = useCart();
  const [menu, setMenu] = useState<MenuCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Load menu data
  useEffect(() => {
    loadMenu();
  }, []);

  const loadMenu = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/menu?brand=ghetto-eats&location_id=...');
      // const data = await response.json();

      // Mock menu data for now
      const mockMenu: MenuCategory[] = [
        {
          id: '1',
          name: 'Wings',
          items: [
            {
              id: 'w1',
              name: 'Hot Wings 10pc',
              description: 'Spicy wings with fries',
              price: 14.99,
              currency: 'USD',
              active: true,
              sold_out: false,
              visible_from: '16:00',
              visible_to: '02:00',
              tags: ['spicy', 'popular'],
            },
            {
              id: 'w2',
              name: 'Lemon Pepper Wings 10pc',
              description: 'Tangy lemon pepper seasoning with fries',
              price: 14.99,
              currency: 'USD',
              active: true,
              sold_out: false,
              visible_from: '16:00',
              visible_to: '02:00',
              tags: ['popular'],
            },
          ],
        },
        {
          id: '2',
          name: 'Burgers',
          items: [
            {
              id: 'b1',
              name: 'Double Cheeseburger',
              description: 'Two beef patties, cheese, lettuce, tomato, special sauce',
              price: 12.99,
              currency: 'USD',
              active: true,
              sold_out: false,
              visible_from: '11:00',
              visible_to: '02:00',
              tags: ['popular'],
            },
            {
              id: 'b2',
              name: 'Bacon Burger',
              description: 'Beef patty, crispy bacon, cheese, BBQ sauce',
              price: 13.99,
              currency: 'USD',
              active: true,
              sold_out: true, // Sold out example
              visible_from: '11:00',
              visible_to: '02:00',
              tags: [],
            },
          ],
        },
        {
          id: '3',
          name: 'Sides',
          items: [
            {
              id: 's1',
              name: 'French Fries',
              description: 'Crispy golden fries',
              price: 3.99,
              currency: 'USD',
              active: true,
              sold_out: false,
              visible_from: '11:00',
              visible_to: '02:00',
              tags: [],
            },
            {
              id: 's2',
              name: 'Onion Rings',
              description: 'Crispy beer-battered onion rings',
              price: 4.99,
              currency: 'USD',
              active: true,
              sold_out: false,
              visible_from: '11:00',
              visible_to: '02:00',
              tags: [],
            },
          ],
        },
      ];

      setMenu(mockMenu);
      if (mockMenu.length > 0) {
        setSelectedCategory(mockMenu[0].id);
      }
    } catch (error) {
      console.error('Failed to load menu:', error);
    } finally {
      setLoading(false);
    }
  };

  const isItemAvailable = (item: MenuItem): boolean => {
    if (!item.active) return false;
    if (item.sold_out) return false;

    // Check time window
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    // Simple time comparison (production would handle day boundaries)
    return currentTime >= item.visible_from && currentTime <= item.visible_to;
  };

  const getItemButtonText = (item: MenuItem): string => {
    if (!item.active) return 'Unavailable';
    if (item.sold_out) return 'Sold Out';
    if (!isItemAvailable(item)) return 'Closed';
    return 'Add to Cart';
  };

  const handleAddToCart = (item: MenuItem) => {
    if (!isItemAvailable(item)) return;

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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-8 rounded-lg">
        <h1 className="text-4xl font-bold mb-2">Ghetto Eats</h1>
        <p className="text-red-100">Late night food, delivered fast</p>
      </div>

      {/* Category Tabs */}
      <div className="flex space-x-4 border-b border-gray-200">
        {menu.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`pb-4 px-4 font-medium transition ${
              selectedCategory === category.id
                ? 'border-b-2 border-red-600 text-red-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>

      {/* Menu Items */}
      {menu
        .filter((category) => category.id === selectedCategory)
        .map((category) => (
          <div key={category.id} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {category.items.map((item) => {
              const available = isItemAvailable(item);

              return (
                <div
                  key={item.id}
                  className={`bg-white rounded-lg shadow-md overflow-hidden ${
                    !available ? 'opacity-60' : ''
                  }`}
                >
                  {/* Item Image */}
                  <div className="h-48 bg-gray-200 flex items-center justify-center">
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-gray-400">No image</span>
                    )}
                  </div>

                  {/* Item Details */}
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-lg">{item.name}</h3>
                      <span className="font-bold text-red-600">
                        ${item.price.toFixed(2)}
                      </span>
                    </div>

                    <p className="text-gray-600 text-sm mb-4">{item.description}</p>

                    {/* Tags */}
                    {item.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {item.tags.map((tag) => (
                          <span
                            key={tag}
                            className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Add to Cart Button */}
                    <button
                      onClick={() => handleAddToCart(item)}
                      disabled={!available}
                      className={`w-full py-2 px-4 rounded-lg font-medium transition ${
                        available
                          ? 'bg-red-600 text-white hover:bg-red-700'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      {getItemButtonText(item)}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ))}

      {/* Cart Summary (Fixed at bottom on mobile) */}
      {cart.items.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg md:relative md:shadow-none">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div>
              <p className="font-medium">
                {cart.items.length} item{cart.items.length !== 1 ? 's' : ''} in cart
              </p>
              <p className="text-sm text-gray-600">
                Subtotal: ${cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)}
              </p>
            </div>
            <button className="bg-red-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-700 transition">
              Checkout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
