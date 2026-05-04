import React, { useState, useEffect } from 'react';
import { MapPin, Clock, CheckCircle, Truck, Package, Home } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useOrders } from '../../hooks/useOrders';
import type { Order as BackendOrder } from '../../types/backend';

interface Order {
  id: string;
  order_number: string;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'out_for_delivery' | 'delivered' | 'cancelled';
  brand: 'ghetto-eats' | 'goldkey' | 'chic-on-chain';
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  total: number;
  created_at: string;
  estimated_delivery?: string;
  driver?: {
    name: string;
    phone: string;
    vehicle: string;
    current_location?: { lat: number; lng: number };
  };
}

export default function OrderTrackingPage() {
  const { user } = useAuth();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Use the real API hook with 30-second refresh
  const { data: backendOrders, loading, refetch } = useOrders(
    { limit: 50 },
    { refetchInterval: 30000 }
  );

  // Transform backend orders to UI format
  const orders: Order[] = (backendOrders || []).map((order: BackendOrder) => ({
    id: order.order_id,
    order_number: order.order_id,
    status: order.status?.toLowerCase().replace(' ', '_') as Order['status'] || 'pending',
    brand: order.brand_id?.toLowerCase().replace('brand-', '') as Order['brand'] || 'ghetto-eats',
    items: order.items?.map((item: any) => ({
      name: item.product_name || item.name,
      quantity: item.quantity,
      price: item.unit_price || item.price
    })) || [],
    total: order.total || 0,
    created_at: order.created_at,
    estimated_delivery: order.estimated_ready_time,
    driver: order.driver_id ? {
      name: 'Driver',
      phone: '(555) 000-0000',
      vehicle: 'Vehicle'
    } : undefined
  }));

  // Auto-select first order when data loads
  useEffect(() => {
    if (orders.length > 0 && !selectedOrder) {
      setSelectedOrder(orders[0]);
    }
  }, [orders]);

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5" />;
      case 'confirmed':
        return <CheckCircle className="w-5 h-5" />;
      case 'preparing':
        return <Package className="w-5 h-5" />;
      case 'ready':
        return <CheckCircle className="w-5 h-5" />;
      case 'out_for_delivery':
        return <Truck className="w-5 h-5" />;
      case 'delivered':
        return <Home className="w-5 h-5" />;
      default:
        return <Clock className="w-5 h-5" />;
    }
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'delivered':
        return 'text-green-600 bg-green-100';
      case 'out_for_delivery':
        return 'text-blue-600 bg-blue-100';
      case 'cancelled':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-yellow-600 bg-yellow-100';
    }
  };

  const getBrandColor = (brand: Order['brand']) => {
    switch (brand) {
      case 'ghetto-eats':
        return 'text-red-600';
      case 'chic-on-chain':
        return 'text-purple-600';
      case 'goldkey':
        return 'text-yellow-600';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-medium text-gray-900 mb-2">No orders yet</h3>
        <p className="text-gray-600 mb-6">Start ordering from your favorite brands!</p>
        <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
          Browse Menu
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Order Tracking</h1>
        <button
          onClick={() => refetch()}
          className="text-blue-600 hover:text-blue-700 font-medium"
        >
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Orders List */}
        <div className="lg:col-span-1 space-y-4">
          <h2 className="font-semibold text-lg">Your Orders</h2>
          {orders.map((order) => (
            <div
              key={order.id}
              onClick={() => setSelectedOrder(order)}
              className={`bg-white rounded-lg shadow-md p-4 cursor-pointer transition hover:shadow-lg ${
                selectedOrder?.id === order.id ? 'ring-2 ring-blue-500' : ''
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-medium">{order.order_number}</p>
                  <p className={`text-sm font-medium ${getBrandColor(order.brand)}`}>
                    {order.brand.replace('-', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                  </p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                  {order.status.replace('_', ' ')}
                </span>
              </div>
              <p className="text-sm text-gray-600">
                {order.items.length} item{order.items.length !== 1 ? 's' : ''} · ${order.total.toFixed(2)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {new Date(order.created_at).toLocaleDateString()} at{' '}
                {new Date(order.created_at).toLocaleTimeString()}
              </p>
            </div>
          ))}
        </div>

        {/* Order Details */}
        {selectedOrder && (
          <div className="lg:col-span-2 space-y-6">
            {/* Status Timeline */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="font-semibold text-lg mb-4">Order Status</h2>
              <div className="space-y-4">
                {['confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered'].map((status, index) => {
                  const isComplete = ['confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered'].indexOf(selectedOrder.status) >= index;
                  const isCurrent = status === selectedOrder.status;

                  return (
                    <div key={status} className="flex items-center gap-4">
                      <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                        isComplete ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                      } ${isCurrent ? 'ring-4 ring-green-200' : ''}`}>
                        {getStatusIcon(status as Order['status'])}
                      </div>
                      <div className="flex-1">
                        <p className={`font-medium ${isComplete ? 'text-gray-900' : 'text-gray-400'}`}>
                          {status.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                        </p>
                        {isCurrent && selectedOrder.estimated_delivery && (
                          <p className="text-sm text-gray-600">
                            ETA: {new Date(selectedOrder.estimated_delivery).toLocaleTimeString()}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Driver Info */}
            {selectedOrder.driver && selectedOrder.status === 'out_for_delivery' && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="font-semibold text-lg mb-4">Driver Information</h2>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-bold text-lg">
                      {selectedOrder.driver.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium">{selectedOrder.driver.name}</p>
                    <p className="text-sm text-gray-600">{selectedOrder.driver.vehicle}</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                    Call Driver
                  </button>
                  <button className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50">
                    Message
                  </button>
                </div>
              </div>
            )}

            {/* Order Items */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="font-semibold text-lg mb-4">Order Details</h2>
              <div className="space-y-3">
                {selectedOrder.items.map((item, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
                <div className="border-t pt-3 mt-3">
                  <div className="flex justify-between items-center font-bold text-lg">
                    <span>Total</span>
                    <span>${selectedOrder.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button className="flex-1 border border-gray-300 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-50">
                Reorder
              </button>
              {selectedOrder.status !== 'delivered' && selectedOrder.status !== 'cancelled' && (
                <button className="flex-1 border border-red-300 text-red-700 px-4 py-3 rounded-lg hover:bg-red-50">
                  Cancel Order
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
