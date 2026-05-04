# Frontend Implementation Guide: Checkout Flow

**Version**: 1.0.0  
**Last Updated**: April 24, 2026  
**Owner**: Frontend Engineering Team  
**Status**: Implementation Guide

---

## 1. Overview

This guide provides step-by-step instructions for implementing the complete customer checkout flow, including:
- **Menu browsing** (browse items, view details, dietary filters)
- **Cart management** (add/remove items, update quantities, save for later)
- **Checkout process** (delivery address, payment method, order placement)
- **Order tracking** (real-time status updates, driver location)
- **Order history** (past orders, reorder with one click)

---

## 2. User Flow

```
CUSTOMER JOURNEY:
1. Browse Menu → Filter by dietary preferences
2. View Item Details → See ingredients, nutrition, allergens
3. Add to Cart → Customize item (size, extras, special instructions)
4. Review Cart → Update quantities, apply promo code
5. Checkout → Select delivery address, choose payment method
6. Place Order → Confirm and pay
7. Track Order → Real-time status updates, driver location (live map)
8. Receive Order → Rate and review
```

---

## 3. Tech Stack

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Framework** | React 18 + TypeScript | Type-safe component development |
| **Routing** | React Router v6 | Client-side routing |
| **State Management** | Zustand | Global state (cart, user) |
| **Forms** | React Hook Form + Zod | Form validation and handling |
| **Styling** | Tailwind CSS v4 | Utility-first styling |
| **API Client** | Supabase JS SDK | Database queries, authentication |
| **Realtime** | Supabase Realtime | Order status updates (WebSocket) |
| **Payments** | Stripe.js, PayPal SDK | Secure payment processing |
| **Maps** | React Leaflet | Order tracking map |

---

## 4. Project Structure

```
src/
├── app/
│   ├── App.tsx                     # Main app component
│   ├── components/
│   │   ├── menu/
│   │   │   ├── MenuGrid.tsx       # Menu items grid
│   │   │   ├── MenuItem.tsx       # Single menu item card
│   │   │   ├── MenuItemDetails.tsx # Item detail modal
│   │   │   ├── MenuFilters.tsx    # Dietary filters
│   │   ├── cart/
│   │   │   ├── CartButton.tsx     # Floating cart button (shows item count)
│   │   │   ├── CartSidebar.tsx    # Slide-out cart panel
│   │   │   ├── CartItem.tsx       # Individual cart item
│   │   ├── checkout/
│   │   │   ├── CheckoutFlow.tsx   # Multi-step checkout wizard
│   │   │   ├── DeliveryAddressForm.tsx
│   │   │   ├── PaymentMethodSelector.tsx
│   │   │   ├── OrderSummary.tsx   # Final review before placing order
│   │   ├── tracking/
│   │   │   ├── OrderTracker.tsx   # Real-time order status
│   │   │   ├── DriverLocationMap.tsx # Live driver location
│   │   ├── common/
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Loading.tsx
│   │   │   ├── ErrorBoundary.tsx
│   ├── pages/
│   │   ├── MenuPage.tsx           # /menu
│   │   ├── CheckoutPage.tsx       # /checkout
│   │   ├── OrderConfirmationPage.tsx # /orders/:id/confirmed
│   │   ├── OrderTrackingPage.tsx  # /orders/:id
│   │   ├── OrderHistoryPage.tsx   # /orders
│   ├── stores/
│   │   ├── cartStore.ts           # Cart state (Zustand)
│   │   ├── userStore.ts           # User profile state
│   ├── lib/
│   │   ├── supabase.ts            # Supabase client
│   │   ├── utils.ts               # Helper functions
│   │   ├── validation.ts          # Zod schemas
│   ├── hooks/
│   │   ├── useMenu.ts             # Fetch menu items
│   │   ├── useCart.ts             # Cart operations
│   │   ├── useOrder.ts            # Place order, track order
│   │   ├── useRealtime.ts         # Realtime subscriptions
│   ├── styles/
│   │   ├── global.css             # Global styles, Tailwind imports
│   │   ├── theme.css              # Theme tokens (Tailwind v4)
├── main.tsx                       # App entry point
```

---

## 5. Implementation: Menu Browsing

### 5.1 Fetch Menu Items (Hook)

**src/app/hooks/useMenu.ts**:
```typescript
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface MenuItem {
  menu_item_id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url: string;
  dietary_tags: string[]; // ['vegan', 'gluten-free', 'spicy']
  allergens: string[];
  available: boolean;
}

export function useMenu(tenantId: string, filters?: {
  category?: string;
  dietary?: string[];
  search?: string;
}) {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMenuItems();
  }, [tenantId, filters]);

  async function fetchMenuItems() {
    setLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('menu_items')
        .select('*')
        .eq('tenant_id', tenantId)
        .eq('available', true)
        .order('category', { ascending: true })
        .order('name', { ascending: true });

      // Apply category filter
      if (filters?.category) {
        query = query.eq('category', filters.category);
      }

      // Apply dietary filter (requires array contains)
      if (filters?.dietary && filters.dietary.length > 0) {
        query = query.contains('dietary_tags', filters.dietary);
      }

      // Apply search filter
      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      setMenuItems(data || []);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching menu:', err);
    } finally {
      setLoading(false);
    }
  }

  return { menuItems, loading, error, refetch: fetchMenuItems };
}
```

### 5.2 Menu Grid Component

**src/app/components/menu/MenuGrid.tsx**:
```typescript
import { useState } from 'react';
import { useMenu } from '@/hooks/useMenu';
import { MenuItem } from './MenuItem';
import { MenuFilters } from './MenuFilters';
import { MenuItemDetails } from './MenuItemDetails';

export function MenuGrid({ tenantId }: { tenantId: string }) {
  const [filters, setFilters] = useState<{
    category?: string;
    dietary?: string[];
    search?: string;
  }>({});
  const [selectedItem, setSelectedItem] = useState<string | null>(null);

  const { menuItems, loading, error } = useMenu(tenantId, filters);

  if (loading) return <div className="text-center py-12">Loading menu...</div>;
  if (error) return <div className="text-red-600 py-12">Error: {error}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Menu</h1>

      {/* Filters */}
      <MenuFilters
        filters={filters}
        onFilterChange={setFilters}
      />

      {/* Menu Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-8">
        {menuItems.map((item) => (
          <MenuItem
            key={item.menu_item_id}
            item={item}
            onClick={() => setSelectedItem(item.menu_item_id)}
          />
        ))}
      </div>

      {/* Item Details Modal */}
      {selectedItem && (
        <MenuItemDetails
          menuItemId={selectedItem}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </div>
  );
}
```

**src/app/components/menu/MenuItem.tsx**:
```typescript
interface MenuItemProps {
  item: {
    menu_item_id: string;
    name: string;
    description: string;
    price: number;
    image_url: string;
    dietary_tags: string[];
  };
  onClick: () => void;
}

export function MenuItem({ item, onClick }: MenuItemProps) {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow cursor-pointer overflow-hidden"
    >
      <img
        src={item.image_url || '/placeholder-food.jpg'}
        alt={item.name}
        className="w-full h-48 object-cover"
      />
      
      <div className="p-4">
        <h3 className="text-xl font-semibold mb-2">{item.name}</h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{item.description}</p>
        
        {/* Dietary Tags */}
        {item.dietary_tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {item.dietary_tags.map((tag) => (
              <span
                key={tag}
                className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
        
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold">${item.price.toFixed(2)}</span>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}
```

### 5.3 Menu Filters Component

**src/app/components/menu/MenuFilters.tsx**:
```typescript
interface MenuFiltersProps {
  filters: {
    category?: string;
    dietary?: string[];
    search?: string;
  };
  onFilterChange: (filters: any) => void;
}

export function MenuFilters({ filters, onFilterChange }: MenuFiltersProps) {
  const categories = ['All', 'Appetizers', 'Entrees', 'Sides', 'Desserts', 'Beverages'];
  const dietaryOptions = ['Vegan', 'Vegetarian', 'Gluten-Free', 'Dairy-Free', 'Nut-Free'];

  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-4">
      {/* Search */}
      <div>
        <input
          type="text"
          placeholder="Search menu items..."
          value={filters.search || ''}
          onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
          className="w-full px-4 py-2 border rounded-lg"
        />
      </div>

      {/* Category Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => onFilterChange({
                ...filters,
                category: cat === 'All' ? undefined : cat
              })}
              className={`px-4 py-2 rounded-lg ${
                (cat === 'All' && !filters.category) || filters.category === cat
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Dietary Filters */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Dietary Preferences</label>
        <div className="flex flex-wrap gap-2">
          {dietaryOptions.map((option) => (
            <label key={option} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={filters.dietary?.includes(option.toLowerCase()) || false}
                onChange={(e) => {
                  const newDietary = e.target.checked
                    ? [...(filters.dietary || []), option.toLowerCase()]
                    : (filters.dietary || []).filter((d) => d !== option.toLowerCase());
                  onFilterChange({ ...filters, dietary: newDietary });
                }}
                className="rounded"
              />
              <span className="text-sm">{option}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
```

---

## 6. Implementation: Cart Management

### 6.1 Cart Store (Zustand)

**src/app/stores/cartStore.ts**:
```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CartItem {
  menu_item_id: string;
  name: string;
  price: number;
  quantity: number;
  special_instructions?: string;
  image_url?: string;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (menuItemId: string) => void;
  updateQuantity: (menuItemId: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => set((state) => {
        const existingItem = state.items.find((i) => i.menu_item_id === item.menu_item_id);
        
        if (existingItem) {
          // Increment quantity if item already in cart
          return {
            items: state.items.map((i) =>
              i.menu_item_id === item.menu_item_id
                ? { ...i, quantity: i.quantity + 1 }
                : i
            )
          };
        } else {
          // Add new item
          return {
            items: [...state.items, { ...item, quantity: 1 }]
          };
        }
      }),

      removeItem: (menuItemId) => set((state) => ({
        items: state.items.filter((item) => item.menu_item_id !== menuItemId)
      })),

      updateQuantity: (menuItemId, quantity) => set((state) => ({
        items: quantity > 0
          ? state.items.map((item) =>
              item.menu_item_id === menuItemId ? { ...item, quantity } : item
            )
          : state.items.filter((item) => item.menu_item_id !== menuItemId)
      })),

      clearCart: () => set({ items: [] }),

      getTotal: () => {
        const { items } = get();
        return items.reduce((total, item) => total + item.price * item.quantity, 0);
      },

      getItemCount: () => {
        const { items } = get();
        return items.reduce((count, item) => count + item.quantity, 0);
      }
    }),
    {
      name: 'glenkeos-cart' // LocalStorage key
    }
  )
);
```

### 6.2 Cart Button (Floating)

**src/app/components/cart/CartButton.tsx**:
```typescript
import { useState } from 'react';
import { useCartStore } from '@/stores/cartStore';
import { CartSidebar } from './CartSidebar';

export function CartButton() {
  const [isOpen, setIsOpen] = useState(false);
  const itemCount = useCartStore((state) => state.getItemCount());
  const total = useCartStore((state) => state.getTotal());

  return (
    <>
      {/* Floating Cart Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all hover:scale-110 p-4 z-50"
      >
        <div className="relative">
          🛒
          {itemCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
              {itemCount}
            </span>
          )}
        </div>
        {itemCount > 0 && (
          <div className="text-sm font-bold mt-1">${total.toFixed(2)}</div>
        )}
      </button>

      {/* Cart Sidebar */}
      <CartSidebar isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
```

### 6.3 Cart Sidebar

**src/app/components/cart/CartSidebar.tsx**:
```typescript
import { useCartStore } from '@/stores/cartStore';
import { CartItem } from './CartItem';
import { useNavigate } from 'react-router-dom';

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CartSidebar({ isOpen, onClose }: CartSidebarProps) {
  const navigate = useNavigate();
  const items = useCartStore((state) => state.items);
  const total = useCartStore((state) => state.getTotal());
  const clearCart = useCartStore((state) => state.clearCart);

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
      />

      {/* Sidebar */}
      <div className="fixed right-0 top-0 bottom-0 w-96 bg-white shadow-xl z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold">Your Cart</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {items.length === 0 ? (
            <div className="text-center text-gray-500 py-12">
              Your cart is empty
            </div>
          ) : (
            items.map((item) => (
              <CartItem key={item.menu_item_id} item={item} />
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t p-6 space-y-4">
            <div className="flex items-center justify-between text-xl font-bold">
              <span>Total:</span>
              <span>${total.toFixed(2)}</span>
            </div>

            <button
              onClick={() => {
                navigate('/checkout');
                onClose();
              }}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-semibold"
            >
              Checkout
            </button>

            <button
              onClick={clearCart}
              className="w-full text-red-600 py-2 hover:text-red-700 text-sm"
            >
              Clear Cart
            </button>
          </div>
        )}
      </div>
    </>
  );
}
```

**src/app/components/cart/CartItem.tsx**:
```typescript
import { useCartStore } from '@/stores/cartStore';

interface CartItemProps {
  item: {
    menu_item_id: string;
    name: string;
    price: number;
    quantity: number;
    image_url?: string;
  };
}

export function CartItem({ item }: CartItemProps) {
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);

  return (
    <div className="flex gap-4 bg-gray-50 p-4 rounded-lg">
      <img
        src={item.image_url || '/placeholder-food.jpg'}
        alt={item.name}
        className="w-20 h-20 object-cover rounded-lg"
      />

      <div className="flex-1">
        <h3 className="font-semibold">{item.name}</h3>
        <p className="text-gray-600">${item.price.toFixed(2)}</p>

        <div className="flex items-center gap-2 mt-2">
          <button
            onClick={() => updateQuantity(item.menu_item_id, item.quantity - 1)}
            className="bg-gray-200 px-2 py-1 rounded hover:bg-gray-300"
          >
            −
          </button>
          <span className="w-8 text-center">{item.quantity}</span>
          <button
            onClick={() => updateQuantity(item.menu_item_id, item.quantity + 1)}
            className="bg-gray-200 px-2 py-1 rounded hover:bg-gray-300"
          >
            +
          </button>
        </div>
      </div>

      <button
        onClick={() => removeItem(item.menu_item_id)}
        className="text-red-600 hover:text-red-700"
      >
        🗑️
      </button>
    </div>
  );
}
```

---

## 7. Implementation: Checkout Flow

### 7.1 Checkout Page

**src/app/pages/CheckoutPage.tsx**:
```typescript
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '@/stores/cartStore';
import { DeliveryAddressForm } from '@/components/checkout/DeliveryAddressForm';
import { PaymentMethodSelector } from '@/components/checkout/PaymentMethodSelector';
import { OrderSummary } from '@/components/checkout/OrderSummary';
import { supabase } from '@/lib/supabase';

export function CheckoutPage() {
  const navigate = useNavigate();
  const items = useCartStore((state) => state.items);
  const total = useCartStore((state) => state.getTotal());
  const clearCart = useCartStore((state) => state.clearCart);

  const [step, setStep] = useState(1); // 1: Address, 2: Payment, 3: Review
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'paypal'>('stripe');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handlePlaceOrder() {
    setLoading(true);
    setError(null);

    try {
      // Step 1: Create order in database
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          tenant_id: 'chic-on-chain-001', // TODO: Get from current store context
          customer_id: (await supabase.auth.getUser()).data.user?.id,
          total_amount: total,
          delivery_address: deliveryAddress,
          status: 'PENDING'
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Step 2: Create order items
      const orderItems = items.map((item) => ({
        order_id: order.order_id,
        menu_item_id: item.menu_item_id,
        quantity: item.quantity,
        unit_price: item.price,
        special_instructions: item.special_instructions
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Step 3: Initiate payment (handled by payment component)
      // Payment component will update order status to CONFIRMED after successful payment

      // Clear cart
      clearCart();

      // Redirect to order confirmation
      navigate(`/orders/${order.order_id}/confirmed`);
    } catch (err: any) {
      setError(err.message);
      console.error('Order placement error:', err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">Checkout</h1>

      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-8">
        {['Delivery', 'Payment', 'Review'].map((label, index) => (
          <div
            key={label}
            className={`flex-1 text-center ${
              step > index + 1 ? 'text-green-600' : step === index + 1 ? 'text-blue-600' : 'text-gray-400'
            }`}
          >
            <div
              className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center border-2 ${
                step > index + 1
                  ? 'bg-green-600 border-green-600 text-white'
                  : step === index + 1
                  ? 'bg-blue-600 border-blue-600 text-white'
                  : 'border-gray-400'
              }`}
            >
              {step > index + 1 ? '✓' : index + 1}
            </div>
            <div className="mt-2 text-sm font-medium">{label}</div>
          </div>
        ))}
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-lg shadow p-8">
        {step === 1 && (
          <DeliveryAddressForm
            value={deliveryAddress}
            onChange={setDeliveryAddress}
            onNext={() => setStep(2)}
          />
        )}

        {step === 2 && (
          <PaymentMethodSelector
            value={paymentMethod}
            onChange={setPaymentMethod}
            onNext={() => setStep(3)}
            onBack={() => setStep(1)}
          />
        )}

        {step === 3 && (
          <OrderSummary
            items={items}
            total={total}
            deliveryAddress={deliveryAddress}
            paymentMethod={paymentMethod}
            onPlaceOrder={handlePlaceOrder}
            onBack={() => setStep(2)}
            loading={loading}
            error={error}
          />
        )}
      </div>
    </div>
  );
}
```

---

## 8. Testing

### 8.1 Manual Testing Checklist

- [ ] Browse menu (all items load correctly)
- [ ] Filter by category (filters work)
- [ ] Filter by dietary tags (checkboxes work)
- [ ] Search menu (search returns correct results)
- [ ] Add item to cart (cart count increments)
- [ ] Update quantity in cart (increment/decrement buttons work)
- [ ] Remove item from cart (item disappears)
- [ ] Cart persists on page reload (LocalStorage works)
- [ ] Checkout flow completes (order created in database)
- [ ] Payment integration works (Stripe/PayPal test mode)
- [ ] Order confirmation shown (redirect to /orders/:id/confirmed)
- [ ] Order tracking works (real-time status updates via Realtime)

### 8.2 E2E Tests (Playwright)

**tests/e2e/checkout.spec.ts**:
```typescript
import { test, expect } from '@playwright/test';

test.describe('Checkout Flow', () => {
  test('should complete full checkout process', async ({ page }) => {
    // Navigate to menu
    await page.goto('/menu');

    // Add item to cart
    await page.click('[data-testid="menu-item-1"] button:has-text("Add to Cart")');

    // Open cart
    await page.click('[data-testid="cart-button"]');

    // Verify item in cart
    await expect(page.locator('[data-testid="cart-item"]')).toBeVisible();

    // Proceed to checkout
    await page.click('button:has-text("Checkout")');

    // Fill delivery address
    await page.fill('[name="address"]', '123 Main St, San Francisco, CA 94105');
    await page.click('button:has-text("Next")');

    // Select payment method
    await page.click('[data-testid="payment-stripe"]');
    await page.click('button:has-text("Next")');

    // Review and place order
    await page.click('button:has-text("Place Order")');

    // Verify order confirmation
    await expect(page).toHaveURL(/\/orders\/.+\/confirmed/);
    await expect(page.locator('h1:has-text("Order Confirmed")')).toBeVisible();
  });
});
```

---

## 9. Production Checklist

- [ ] All Tailwind CSS classes optimized (unused styles purged)
- [ ] Images optimized (WebP format, lazy loading)
- [ ] Error boundaries implemented (prevent full app crash)
- [ ] Loading states for all async operations
- [ ] Form validation (Zod schemas enforced)
- [ ] Mobile responsive (test on iPhone, Android)
- [ ] Accessibility (ARIA labels, keyboard navigation)
- [ ] SEO meta tags (title, description, Open Graph)
- [ ] Analytics tracking (Google Analytics, Mixpanel)
- [ ] Performance monitoring (Sentry Performance)

---

**Frontend is customer-facing. User experience is paramount.**
