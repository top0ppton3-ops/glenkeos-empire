import { useState } from 'react';
import { Link } from 'react-router';
import { BrandSelector } from './components/BrandSelector';
import { MenuBrowser } from './components/MenuBrowser';
import { ShoppingCart } from './components/ShoppingCart';
import { Checkout } from './components/Checkout';
import { OrderTracking } from './components/OrderTracking';
import { LoyaltyDashboard } from './components/LoyaltyDashboard';
import { GoldKeyBooking } from './components/GoldKeyBooking';

type View = 'brands' | 'menu' | 'cart' | 'checkout' | 'orders' | 'loyalty' | 'goldkey';

interface CartItem {
  menuItemId: string;
  name: string;
  quantity: number;
  selectedOptions: Array<{ id: string; name: string; price: number }>;
  resolvedPrice: number;
}

export default function CustomerDashboard() {
  const [currentView, setCurrentView] = useState<View>('brands');
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orderHistory, setOrderHistory] = useState<Array<{ id: string; date: string; total: number }>>([]);

  const handleBrandSelect = (brandId: string, locationId: string) => {
    setSelectedBrand(brandId);
    setSelectedLocation(locationId);
    setCurrentView('menu');
  };

  const handleAddToCart = (item: CartItem) => {
    setCart((prevCart) => {
      // Check if item with same options already exists
      const existingItemIndex = prevCart.findIndex(
        (cartItem) =>
          cartItem.menuItemId === item.menuItemId &&
          JSON.stringify(cartItem.selectedOptions) === JSON.stringify(item.selectedOptions)
      );

      if (existingItemIndex >= 0) {
        // Increase quantity of existing item
        const updatedCart = [...prevCart];
        updatedCart[existingItemIndex].quantity += item.quantity;
        return updatedCart;
      } else {
        // Add new item
        return [...prevCart, item];
      }
    });
  };

  const handleRemoveFromCart = (index: number) => {
    setCart((prevCart) => prevCart.filter((_, i) => i !== index));
  };

  const handleUpdateQuantity = (index: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      handleRemoveFromCart(index);
      return;
    }

    setCart((prevCart) => {
      const updatedCart = [...prevCart];
      updatedCart[index].quantity = newQuantity;
      return updatedCart;
    });
  };

  const handleOrderComplete = (orderId: string) => {
    setOrderHistory((prev) => [
      {
        id: orderId,
        date: new Date().toISOString(),
        total: cart.reduce((sum, item) => sum + item.resolvedPrice * item.quantity, 0),
      },
      ...prev,
    ]);
    setCart([]);
    setCurrentView('orders');
  };

  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      {currentView !== 'checkout' && currentView !== 'goldkey' && (
        <nav className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center space-x-8">
                <Link to="/customer" className="font-bold text-xl text-blue-600">
                  GlenKeos
                </Link>
                <button
                  onClick={() => setCurrentView('brands')}
                  className={`px-3 py-2 rounded ${
                    currentView === 'brands' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Browse Brands
                </button>
                <button
                  onClick={() => setCurrentView('orders')}
                  className={`px-3 py-2 rounded ${
                    currentView === 'orders' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  My Orders
                </button>
                <button
                  onClick={() => setCurrentView('loyalty')}
                  className={`px-3 py-2 rounded ${
                    currentView === 'loyalty' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Rewards
                </button>
                <button
                  onClick={() => setCurrentView('goldkey')}
                  className="px-4 py-2 rounded bg-gradient-to-r from-yellow-400 to-yellow-600 text-white font-medium hover:from-yellow-500 hover:to-yellow-700"
                >
                  🔑 GoldKey
                </button>
              </div>

              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setCurrentView('cart')}
                  className="relative p-2 text-gray-600 hover:text-gray-900"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                  {cartItemCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {cartItemCount}
                    </span>
                  )}
                </button>

                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                  <span className="text-sm font-medium">Guest User</span>
                </div>
              </div>
            </div>
          </div>
        </nav>
      )}

      {/* Main Content Area */}
      <main>
        {/* Brand Selection View */}
        {currentView === 'brands' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold mb-6">Choose Your Brand</h1>
            <BrandSelector onSelectBrand={handleBrandSelect} />
          </div>
        )}

        {/* Menu Browser View */}
        {currentView === 'menu' && selectedBrand && selectedLocation && (
          <MenuBrowser
            brandId={selectedBrand}
            locationId={selectedLocation}
            onAddToCart={handleAddToCart}
            onViewCart={() => setCurrentView('cart')}
          />
        )}

        {/* Shopping Cart View */}
        {currentView === 'cart' && (
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <ShoppingCart
              cart={cart}
              onRemoveItem={handleRemoveFromCart}
              onUpdateQuantity={handleUpdateQuantity}
              onCheckout={() => setCurrentView('checkout')}
              onContinueShopping={() => setCurrentView(selectedBrand ? 'menu' : 'brands')}
            />
          </div>
        )}

        {/* Checkout View */}
        {currentView === 'checkout' && selectedBrand && selectedLocation && (
          <Checkout
            cart={cart}
            brandId={selectedBrand}
            locationId={selectedLocation}
            onBack={() => setCurrentView('cart')}
            onOrderComplete={handleOrderComplete}
          />
        )}

        {/* Order History View */}
        {currentView === 'orders' && (
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold mb-6">My Orders</h1>

            {orderHistory.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <svg
                  className="w-16 h-16 text-gray-300 mx-auto mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <h2 className="text-xl font-bold mb-2">No Orders Yet</h2>
                <p className="text-gray-600 mb-4">Start shopping to see your orders here</p>
                <button
                  onClick={() => setCurrentView('brands')}
                  className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {orderHistory.map((order) => (
                  <div key={order.id} className="bg-white rounded-lg shadow p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-bold text-lg">Order #{order.id.slice(0, 8)}</h3>
                        <p className="text-sm text-gray-600">
                          {new Date(order.date).toLocaleDateString()} at{' '}
                          {new Date(order.date).toLocaleTimeString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">${order.total.toFixed(2)}</p>
                        <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                          Delivered
                        </span>
                      </div>
                    </div>
                    <Link
                      to={`/customer/orders/${order.id}`}
                      className="text-blue-600 hover:text-blue-700 text-sm"
                    >
                      View Details →
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Loyalty Dashboard View */}
        {currentView === 'loyalty' && <LoyaltyDashboard />}

        {/* GoldKey Booking View */}
        {currentView === 'goldkey' && <GoldKeyBooking />}
      </main>
    </div>
  );
}
