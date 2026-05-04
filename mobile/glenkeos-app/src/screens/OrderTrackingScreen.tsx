import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import {supabase} from '../lib/supabase';
import Icon from 'react-native-vector-icons/MaterialIcons';

const ORDER_STATUS_STEPS = [
  {status: 'PENDING', label: 'Order Placed', icon: 'check-circle'},
  {status: 'ACCEPTED', label: 'Accepted', icon: 'restaurant'},
  {status: 'PREPARING', label: 'Preparing', icon: 'local-dining'},
  {status: 'READY', label: 'Ready', icon: 'done-all'},
  {status: 'PICKED_UP', label: 'Out for Delivery', icon: 'local-shipping'},
  {status: 'DELIVERED', label: 'Delivered', icon: 'home'},
];

export default function OrderTrackingScreen({route, navigation}: any) {
  const {orderId} = route.params;
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [driverLocation, setDriverLocation] = useState<any>(null);

  useEffect(() => {
    loadOrder();
    const subscription = subscribeToOrderUpdates();
    return () => {
      subscription.unsubscribe();
    };
  }, [orderId]);

  const loadOrder = async () => {
    try {
      const {data, error} = await supabase
        .from('orders')
        .select('*, order_items(*), driver:drivers(*)')
        .eq('order_id', orderId)
        .single();

      if (error) throw error;
      setOrder(data);

      // Load driver location if assigned
      if (data.driver_id) {
        loadDriverLocation(data.driver_id);
      }
    } catch (error) {
      console.error('Error loading order:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadDriverLocation = async (driverId: string) => {
    try {
      const {data, error} = await supabase
        .from('driver_locations')
        .select('*')
        .eq('driver_id', driverId)
        .order('timestamp', {ascending: false})
        .limit(1)
        .single();

      if (error) throw error;
      setDriverLocation(data);
    } catch (error) {
      console.error('Error loading driver location:', error);
    }
  };

  const subscribeToOrderUpdates = () => {
    return supabase
      .channel('order_updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `order_id=eq.${orderId}`,
        },
        payload => {
          setOrder(payload.new);
        },
      )
      .subscribe();
  };

  const getCurrentStep = () => {
    if (!order) return 0;
    return ORDER_STATUS_STEPS.findIndex(
      step => step.status === order.order_status,
    );
  };

  const getEstimatedTime = () => {
    if (!order) return 'Calculating...';
    const currentStep = getCurrentStep();
    const remainingMinutes = (ORDER_STATUS_STEPS.length - currentStep - 1) * 10;
    return `${remainingMinutes}-${remainingMinutes + 10} min`;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FFD700" />
      </View>
    );
  }

  const currentStep = getCurrentStep();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={28} color="#FFD700" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Tracking</Text>
        <View style={{width: 28}} />
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Order Number */}
        <View style={styles.orderInfoCard}>
          <Text style={styles.orderNumber}>Order #{order.order_number}</Text>
          <Text style={styles.estimatedTime}>
            Estimated: {getEstimatedTime()}
          </Text>
        </View>

        {/* Status Timeline */}
        <View style={styles.timelineSection}>
          {ORDER_STATUS_STEPS.map((step, index) => {
            const isCompleted = index <= currentStep;
            const isCurrent = index === currentStep;

            return (
              <View key={step.status} style={styles.timelineItem}>
                <View style={styles.timelineMarker}>
                  <View
                    style={[
                      styles.timelineDot,
                      isCompleted && styles.timelineDotCompleted,
                      isCurrent && styles.timelineDotCurrent,
                    ]}>
                    <Icon
                      name={step.icon}
                      size={20}
                      color={isCompleted ? '#FFD700' : '#666'}
                    />
                  </View>
                  {index < ORDER_STATUS_STEPS.length - 1 && (
                    <View
                      style={[
                        styles.timelineLine,
                        isCompleted && styles.timelineLineCompleted,
                      ]}
                    />
                  )}
                </View>
                <View style={styles.timelineContent}>
                  <Text
                    style={[
                      styles.timelineLabel,
                      isCompleted && styles.timelineLabelCompleted,
                    ]}>
                    {step.label}
                  </Text>
                  {isCurrent && (
                    <Text style={styles.timelineStatus}>In Progress</Text>
                  )}
                </View>
              </View>
            );
          })}
        </View>

        {/* Driver Info */}
        {order.driver && (
          <View style={styles.driverCard}>
            <Text style={styles.driverCardTitle}>Your Driver</Text>
            <View style={styles.driverInfo}>
              <View style={styles.driverAvatar}>
                <Icon name="person" size={32} color="#FFD700" />
              </View>
              <View style={styles.driverDetails}>
                <Text style={styles.driverName}>{order.driver.driver_name}</Text>
                <Text style={styles.driverVehicle}>
                  {order.driver.vehicle_type}
                </Text>
              </View>
              <TouchableOpacity style={styles.callButton}>
                <Icon name="phone" size={24} color="#FFD700" />
              </TouchableOpacity>
            </View>
            {driverLocation && (
              <Text style={styles.driverETA}>
                {driverLocation.speed > 0
                  ? 'Driver is on the way'
                  : 'Driver arrived'}
              </Text>
            )}
          </View>
        )}

        {/* Order Items */}
        <View style={styles.itemsCard}>
          <Text style={styles.itemsCardTitle}>Order Items</Text>
          {order.order_items?.map((item: any) => (
            <View key={item.item_id} style={styles.orderItem}>
              <Text style={styles.orderItemQty}>{item.quantity}x</Text>
              <Text style={styles.orderItemName}>{item.item_id}</Text>
              <Text style={styles.orderItemPrice}>
                ${(item.subtotal / 100).toFixed(2)}
              </Text>
            </View>
          ))}
          <View style={styles.orderTotal}>
            <Text style={styles.orderTotalLabel}>Total</Text>
            <Text style={styles.orderTotalValue}>
              ${(order.total_amount / 100).toFixed(2)}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      {order.order_status === 'DELIVERED' && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.rateButton}
            onPress={() => {
              /* Navigate to rating screen */
            }}>
            <Text style={styles.rateButtonText}>Rate Your Order</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A1A',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#1A1A1A',
    justifyContent: 'center',
    alignItems: 'center',
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
  orderInfoCard: {
    backgroundColor: '#2A2A2A',
    padding: 20,
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  orderNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 5,
  },
  estimatedTime: {
    fontSize: 16,
    color: '#999',
  },
  timelineSection: {
    padding: 20,
    marginTop: 10,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  timelineMarker: {
    alignItems: 'center',
    marginRight: 15,
  },
  timelineDot: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#2A2A2A',
    borderWidth: 2,
    borderColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timelineDotCompleted: {
    backgroundColor: '#2A2A2A',
    borderColor: '#FFD700',
  },
  timelineDotCurrent: {
    backgroundColor: '#FFD700',
    borderColor: '#FFD700',
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#333',
    marginTop: 5,
  },
  timelineLineCompleted: {
    backgroundColor: '#FFD700',
  },
  timelineContent: {
    flex: 1,
    paddingTop: 12,
  },
  timelineLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 3,
  },
  timelineLabelCompleted: {
    color: '#FFF',
    fontWeight: '600',
  },
  timelineStatus: {
    fontSize: 14,
    color: '#FFD700',
  },
  driverCard: {
    backgroundColor: '#2A2A2A',
    padding: 20,
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 10,
  },
  driverCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 15,
  },
  driverInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  driverAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  driverDetails: {
    flex: 1,
    marginLeft: 15,
  },
  driverName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 3,
  },
  driverVehicle: {
    fontSize: 14,
    color: '#999',
  },
  callButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  driverETA: {
    fontSize: 14,
    color: '#FFD700',
    marginTop: 10,
    textAlign: 'center',
  },
  itemsCard: {
    backgroundColor: '#2A2A2A',
    padding: 20,
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 20,
    borderRadius: 10,
  },
  itemsCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 15,
  },
  orderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  orderItemQty: {
    fontSize: 16,
    color: '#999',
    width: 40,
  },
  orderItemName: {
    flex: 1,
    fontSize: 16,
    color: '#FFF',
  },
  orderItemPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFD700',
  },
  orderTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#333',
    paddingTop: 15,
    marginTop: 10,
  },
  orderTotalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
  },
  orderTotalValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  footer: {
    backgroundColor: '#2A2A2A',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  rateButton: {
    backgroundColor: '#FFD700',
    padding: 18,
    borderRadius: 10,
    alignItems: 'center',
  },
  rateButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
});
