import { useState } from 'react';
import { useNavigate } from 'react-router';
import { createOrderWithSnapshots } from '../../../services/api/snapshots';
import { applyPromoCode } from '../../../services/api/menu-engine';

interface CheckoutProps {
  cart: Array<{
    menuItemId: string;
    name: string;
    quantity: number;
    selectedOptions: Array<{ id: string; name: string; price: number }>;
    resolvedPrice: number;
  }>;
  brandId: string;
  locationId: string;
  onBack: () => void;
  onOrderComplete: (orderId: string) => void;
}

export function Checkout({ cart, brandId, locationId, onBack, onOrderComplete }: CheckoutProps) {
  const navigate = useNavigate();
  const [step, setStep] = useState<'info' | 'payment' | 'processing'>('info');
  const [promoCode, setPromoCode] = useState('');
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [promoError, setPromoError] = useState('');
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);

  // Order info
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState<'delivery' | 'pickup'>('delivery');

  // Payment info
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCvc] = useState('');

  const subtotal = cart.reduce((sum, item) => sum + item.resolvedPrice * item.quantity, 0);
  const deliveryFee = deliveryMethod === 'delivery' ? (subtotal >= 30 ? 0 : 4.99) : 0;
  const taxRate = 0.08;
  const taxAmount = (subtotal + deliveryFee - promoDiscount) * taxRate;
  const total = subtotal + deliveryFee - promoDiscount + taxAmount;

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return;

    setIsApplyingPromo(true);
    setPromoError('');

    try {
      // Get current user ID from auth (mock for now)
      const userId = 'mock-user-id';
      const userTier = 'standard';

      const result = await applyPromoCode(promoCode, subtotal, userId, brandId, userTier);

      if (result.error) {
        setPromoError(result.error);
        setPromoDiscount(0);
      } else {
        setPromoDiscount(result.discount);
        setPromoError('');
      }
    } catch (error) {
      setPromoError('Failed to apply promo code');
      setPromoDiscount(0);
    } finally {
      setIsApplyingPromo(false);
    }
  };

  const handleSubmitOrder = async () => {
    setStep('processing');

    try {
      // Get current user ID from auth (mock for now)
      const userId = 'mock-user-id';

      const orderData = {
        brand_id: brandId,
        location_id: locationId,
        customer_name: customerName,
        customer_phone: customerPhone,
        delivery_address: deliveryMethod === 'delivery' ? deliveryAddress : null,
        special_instructions: specialInstructions,
        delivery_method: deliveryMethod,
        subtotal,
        delivery_fee: deliveryFee,
        tax_amount: taxAmount,
        promo_discount: promoDiscount,
        total_amount: total,
        status: 'pending' as const,
      };

      const items = cart.map(item => ({
        menuItemId: item.menuItemId,
        selectedOptionValueIds: item.selectedOptions.map(opt => opt.id),
        resolvedPrice: item.resolvedPrice,
        quantity: item.quantity,
      }));

      const orderId = await createOrderWithSnapshots(orderData, items, userId);

      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      onOrderComplete(orderId);
      navigate(`/customer/orders/${orderId}`);
    } catch (error) {
      console.error('Order creation failed:', error);
      alert('Failed to create order. Please try again.');
      setStep('payment');
    }
  };

  if (step === 'processing') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-bold mb-2">Processing Your Order</h2>
          <p className="text-gray-600">Please wait while we confirm your order...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <button
          onClick={onBack}
          className="mb-6 text-blue-600 hover:text-blue-700 flex items-center"
        >
          ← Back to Cart
        </button>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Checkout Form */}
          <div className="md:col-span-2 space-y-6">
            {/* Customer Info */}
            {step === 'info' && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold mb-4">Customer Information</h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Order Method *
                    </label>
                    <div className="flex gap-4">
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          value="delivery"
                          checked={deliveryMethod === 'delivery'}
                          onChange={(e) => setDeliveryMethod(e.target.value as 'delivery')}
                          className="mr-2"
                        />
                        Delivery
                      </label>
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          value="pickup"
                          checked={deliveryMethod === 'pickup'}
                          onChange={(e) => setDeliveryMethod(e.target.value as 'pickup')}
                          className="mr-2"
                        />
                        Pickup
                      </label>
                    </div>
                  </div>

                  {deliveryMethod === 'delivery' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Delivery Address *
                      </label>
                      <textarea
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Special Instructions (optional)
                    </label>
                    <textarea
                      value={specialInstructions}
                      onChange={(e) => setSpecialInstructions(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Allergies, preferences, delivery notes..."
                    />
                  </div>

                  <button
                    onClick={() => setStep('payment')}
                    disabled={!customerName || !customerPhone || (deliveryMethod === 'delivery' && !deliveryAddress)}
                    className="w-full bg-blue-600 text-white py-3 rounded font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    Continue to Payment
                  </button>
                </div>
              </div>
            )}

            {/* Payment Info */}
            {step === 'payment' && (
              <div className="bg-white rounded-lg shadow p-6">
                <button
                  onClick={() => setStep('info')}
                  className="mb-4 text-blue-600 hover:text-blue-700 text-sm"
                >
                  ← Edit Customer Info
                </button>

                <h2 className="text-xl font-bold mb-4">Payment Information</h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Card Number *
                    </label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      placeholder="1234 5678 9012 3456"
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Expiry Date *
                      </label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        placeholder="MM/YY"
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        CVC *
                      </label>
                      <input
                        type="text"
                        value={cardCvc}
                        onChange={(e) => setCvc(e.target.value)}
                        placeholder="123"
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded">
                    <p className="text-xs text-gray-600">
                      🔒 Your payment information is encrypted and secure. We never store your full card details.
                    </p>
                  </div>

                  <button
                    onClick={handleSubmitOrder}
                    disabled={!cardNumber || !cardExpiry || !cardCvc}
                    className="w-full bg-green-600 text-white py-3 rounded font-medium hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    Place Order - ${total.toFixed(2)}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-4">
              <h2 className="font-bold mb-4">Order Summary</h2>

              {/* Cart Items */}
              <div className="space-y-3 mb-4 pb-4 border-b">
                {cart.map((item, idx) => (
                  <div key={idx} className="text-sm">
                    <div className="flex justify-between">
                      <span className="font-medium">{item.quantity}x {item.name}</span>
                      <span>${(item.resolvedPrice * item.quantity).toFixed(2)}</span>
                    </div>
                    {item.selectedOptions.length > 0 && (
                      <div className="text-gray-600 text-xs ml-4">
                        {item.selectedOptions.map(opt => opt.name).join(', ')}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Promo Code */}
              <div className="mb-4 pb-4 border-b">
                <label className="block text-sm font-medium mb-2">Promo Code</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                    placeholder="Enter code"
                    className="flex-1 px-3 py-1 text-sm border border-gray-300 rounded"
                  />
                  <button
                    onClick={handleApplyPromo}
                    disabled={isApplyingPromo || !promoCode.trim()}
                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-300"
                  >
                    {isApplyingPromo ? '...' : 'Apply'}
                  </button>
                </div>
                {promoError && (
                  <p className="text-xs text-red-600 mt-1">{promoError}</p>
                )}
                {promoDiscount > 0 && (
                  <p className="text-xs text-green-600 mt-1">Promo applied! -${promoDiscount.toFixed(2)}</p>
                )}
              </div>

              {/* Totals */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                {deliveryMethod === 'delivery' && (
                  <div className="flex justify-between">
                    <span>Delivery Fee</span>
                    <span>{deliveryFee === 0 ? 'FREE' : `$${deliveryFee.toFixed(2)}`}</span>
                  </div>
                )}
                {promoDiscount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Promo Discount</span>
                    <span>-${promoDiscount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Tax (8%)</span>
                  <span>${taxAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-2 border-t">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>

              {deliveryMethod === 'delivery' && subtotal < 30 && (
                <div className="mt-4 bg-blue-50 p-3 rounded text-xs text-blue-700">
                  💡 Add ${(30 - subtotal).toFixed(2)} more for free delivery!
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
