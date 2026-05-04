import React, {useState} from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {supabase} from '../lib/supabase';
import Icon from 'react-native-vector-icons/MaterialIcons';

export default function CheckoutScreen({route, navigation}: any) {
  const {cart, menuItems} = route.params;
  const [loading, setLoading] = useState(false);

  const getCartItems = () => {
    const items: any[] = [];
    cart.forEach((qty: number, itemId: string) => {
      const menuItem = menuItems.find((i: any) => i.item_id === itemId);
      if (menuItem) {
        items.push({...menuItem, quantity: qty});
      }
    });
    return items;
  };

  const getSubtotal = () => {
    return getCartItems().reduce(
      (sum, item) => sum + item.base_price * item.quantity,
      0,
    );
  };

  const getTax = () => {
    return Math.round(getSubtotal() * 0.095); // 9.5% tax
  };

  const getDeliveryFee = () => {
    return 499; // $4.99
  };

  const getTotal = () => {
    return getSubtotal() + getTax() + getDeliveryFee();
  };

  const placeOrder = async () => {
    setLoading(true);
    try {
      // Get current user
      const {
        data: {user},
      } = await supabase.auth.getUser();

      if (!user) {
        Alert.alert('Error', 'Please log in to place an order');
        navigation.navigate('Auth');
        return;
      }

      // Create order
      const {data: order, error: orderError} = await supabase
        .from('orders')
        .insert({
          customer_id: user.id,
          store_id: 'store-coc-001', // Default to downtown LA
          order_type: 'DELIVERY',
          order_status: 'PENDING',
          total_amount: getTotal(),
          subtotal: getSubtotal(),
          tax_amount: getTax(),
          delivery_fee: getDeliveryFee(),
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = getCartItems().map(item => ({
        order_id: order.order_id,
        item_id: item.item_id,
        quantity: item.quantity,
        unit_price: item.base_price,
        subtotal: item.base_price * item.quantity,
      }));

      const {error: itemsError} = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Navigate to order tracking
      Alert.alert(
        'Order Placed!',
        `Your order #${order.order_number} has been placed successfully.`,
        [
          {
            text: 'Track Order',
            onPress: () =>
              navigation.navigate('OrderTracking', {orderId: order.order_id}),
          },
        ],
      );
    } catch (error: any) {
      console.error('Order error:', error);
      Alert.alert('Error', error.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  const cartItems = getCartItems();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={28} color="#FFD700" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout</Text>
        <View style={{width: 28}} />
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Order Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Order</Text>
          {cartItems.map(item => (
            <View key={item.item_id} style={styles.cartItem}>
              <View style={styles.cartItemInfo}>
                <Text style={styles.cartItemName}>{item.item_name}</Text>
                <Text style={styles.cartItemQty}>Qty: {item.quantity}</Text>
              </View>
              <Text style={styles.cartItemPrice}>
                ${((item.base_price * item.quantity) / 100).toFixed(2)}
              </Text>
            </View>
          ))}
        </View>

        {/* Order Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>
              ${(getSubtotal() / 100).toFixed(2)}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tax (9.5%)</Text>
            <Text style={styles.summaryValue}>
              ${(getTax() / 100).toFixed(2)}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Delivery Fee</Text>
            <Text style={styles.summaryValue}>
              ${(getDeliveryFee() / 100).toFixed(2)}
            </Text>
          </View>
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>
              ${(getTotal() / 100).toFixed(2)}
            </Text>
          </View>
        </View>

        {/* Delivery Address */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Address</Text>
          <View style={styles.addressCard}>
            <Icon name="location-on" size={24} color="#FFD700" />
            <View style={styles.addressInfo}>
              <Text style={styles.addressLine}>123 Main Street</Text>
              <Text style={styles.addressLine}>
                Los Angeles, CA 90001
              </Text>
            </View>
            <TouchableOpacity>
              <Icon name="edit" size={20} color="#666" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Payment Method */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          <View style={styles.paymentCard}>
            <Icon name="payment" size={24} color="#FFD700" />
            <View style={styles.paymentInfo}>
              <Text style={styles.paymentType}>PayPal</Text>
              <Text style={styles.paymentDetail}>Default Payment</Text>
            </View>
            <TouchableOpacity>
              <Icon name="edit" size={20} color="#666" />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Place Order Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.placeOrderButton}
          onPress={placeOrder}
          disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#000" />
          ) : (
            <>
              <Text style={styles.placeOrderText}>Place Order</Text>
              <Text style={styles.placeOrderTotal}>
                ${(getTotal() / 100).toFixed(2)}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A1A',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: '#2A2A2A',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 15,
  },
  cartItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  cartItemInfo: {
    flex: 1,
  },
  cartItemName: {
    fontSize: 16,
    color: '#FFF',
    marginBottom: 3,
  },
  cartItemQty: {
    fontSize: 14,
    color: '#999',
  },
  cartItemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#999',
  },
  summaryValue: {
    fontSize: 16,
    color: '#FFF',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#333',
    paddingTop: 10,
    marginTop: 5,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  addressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2A2A2A',
    padding: 15,
    borderRadius: 10,
  },
  addressInfo: {
    flex: 1,
    marginLeft: 15,
  },
  addressLine: {
    fontSize: 14,
    color: '#FFF',
    marginBottom: 3,
  },
  paymentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2A2A2A',
    padding: 15,
    borderRadius: 10,
  },
  paymentInfo: {
    flex: 1,
    marginLeft: 15,
  },
  paymentType: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 3,
  },
  paymentDetail: {
    fontSize: 14,
    color: '#999',
  },
  footer: {
    backgroundColor: '#2A2A2A',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  placeOrderButton: {
    backgroundColor: '#FFD700',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 18,
    borderRadius: 10,
  },
  placeOrderText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  placeOrderTotal: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
});
