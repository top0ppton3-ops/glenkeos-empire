import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import {supabase} from '../lib/supabase';
import Icon from 'react-native-vector-icons/MaterialIcons';

const ORDER_STATUS_CONFIG = {
  PENDING: {color: '#FFA500', icon: 'pending', label: 'Pending'},
  ACCEPTED: {color: '#4CAF50', icon: 'check-circle', label: 'Accepted'},
  PREPARING: {color: '#2196F3', icon: 'restaurant', label: 'Preparing'},
  READY: {color: '#9C27B0', icon: 'done-all', label: 'Ready'},
  PICKED_UP: {color: '#FF9800', icon: 'local-shipping', label: 'Out for Delivery'},
  DELIVERED: {color: '#4CAF50', icon: 'home', label: 'Delivered'},
  CANCELLED: {color: '#F44336', icon: 'cancel', label: 'Cancelled'},
};

export default function OrdersScreen({navigation}: any) {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'active' | 'past'>('active');

  useEffect(() => {
    loadOrders();
    const subscription = subscribeToOrders();
    return () => {
      subscription.unsubscribe();
    };
  }, [filter]);

  const loadOrders = async () => {
    try {
      const {
        data: {user},
      } = await supabase.auth.getUser();

      if (!user) return;

      let query = supabase
        .from('orders')
        .select('*, store:stores(store_name), order_items(quantity)')
        .eq('customer_id', user.id)
        .order('created_at', {ascending: false});

      if (filter === 'active') {
        query = query.in('order_status', [
          'PENDING',
          'ACCEPTED',
          'PREPARING',
          'READY',
          'PICKED_UP',
        ]);
      } else if (filter === 'past') {
        query = query.in('order_status', ['DELIVERED', 'CANCELLED']);
      }

      const {data, error} = await query;

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const subscribeToOrders = () => {
    return supabase
      .channel('my_orders')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
        },
        () => {
          loadOrders();
        },
      )
      .subscribe();
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadOrders();
  };

  const getTotalItems = (order: any) => {
    return order.order_items?.reduce(
      (sum: number, item: any) => sum + item.quantity,
      0,
    );
  };

  const getStatusConfig = (status: string) => {
    return (
      ORDER_STATUS_CONFIG[status as keyof typeof ORDER_STATUS_CONFIG] || {
        color: '#999',
        icon: 'help',
        label: status,
      }
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FFD700" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterTab, filter === 'active' && styles.filterTabActive]}
          onPress={() => setFilter('active')}>
          <Text
            style={[
              styles.filterText,
              filter === 'active' && styles.filterTextActive,
            ]}>
            Active
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterTab, filter === 'past' && styles.filterTabActive]}
          onPress={() => setFilter('past')}>
          <Text
            style={[
              styles.filterText,
              filter === 'past' && styles.filterTextActive,
            ]}>
            Past
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterTab, filter === 'all' && styles.filterTabActive]}
          onPress={() => setFilter('all')}>
          <Text
            style={[
              styles.filterText,
              filter === 'all' && styles.filterTextActive,
            ]}>
            All
          </Text>
        </TouchableOpacity>
      </View>

      {/* Orders List */}
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#FFD700"
          />
        }>
        {orders.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon name="receipt" size={64} color="#666" />
            <Text style={styles.emptyText}>No orders yet</Text>
            <Text style={styles.emptySubtext}>
              Start browsing our menu to place your first order!
            </Text>
            <TouchableOpacity
              style={styles.browseButton}
              onPress={() => navigation.navigate('Menu')}>
              <Text style={styles.browseButtonText}>Browse Menu</Text>
            </TouchableOpacity>
          </View>
        ) : (
          orders.map(order => {
            const statusConfig = getStatusConfig(order.order_status);
            return (
              <TouchableOpacity
                key={order.order_id}
                style={styles.orderCard}
                onPress={() =>
                  navigation.navigate('Tracking', {orderId: order.order_id})
                }>
                <View style={styles.orderHeader}>
                  <View style={styles.orderInfo}>
                    <Text style={styles.orderNumber}>
                      #{order.order_number}
                    </Text>
                    <Text style={styles.orderStore}>
                      {order.store?.store_name || 'Store'}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      {backgroundColor: `${statusConfig.color}20`},
                    ]}>
                    <Icon
                      name={statusConfig.icon}
                      size={16}
                      color={statusConfig.color}
                    />
                    <Text
                      style={[styles.statusText, {color: statusConfig.color}]}>
                      {statusConfig.label}
                    </Text>
                  </View>
                </View>

                <View style={styles.orderDetails}>
                  <View style={styles.orderDetailRow}>
                    <Icon name="shopping-cart" size={16} color="#999" />
                    <Text style={styles.orderDetailText}>
                      {getTotalItems(order)} items
                    </Text>
                  </View>
                  <View style={styles.orderDetailRow}>
                    <Icon name="access-time" size={16} color="#999" />
                    <Text style={styles.orderDetailText}>
                      {new Date(order.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </Text>
                  </View>
                </View>

                <View style={styles.orderFooter}>
                  <Text style={styles.orderTotal}>
                    ${(order.total_amount / 100).toFixed(2)}
                  </Text>
                  <View style={styles.viewDetailsButton}>
                    <Text style={styles.viewDetailsText}>View Details</Text>
                    <Icon name="chevron-right" size={20} color="#FFD700" />
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
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
  filterContainer: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#2A2A2A',
    gap: 10,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    backgroundColor: '#1A1A1A',
    alignItems: 'center',
  },
  filterTabActive: {
    backgroundColor: '#FFD700',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#999',
  },
  filterTextActive: {
    color: '#000',
  },
  scrollView: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    marginTop: 60,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
    marginTop: 20,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 10,
    textAlign: 'center',
  },
  browseButton: {
    backgroundColor: '#FFD700',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginTop: 20,
  },
  browseButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  orderCard: {
    backgroundColor: '#2A2A2A',
    marginHorizontal: 15,
    marginVertical: 8,
    padding: 15,
    borderRadius: 10,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  orderInfo: {
    flex: 1,
  },
  orderNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 4,
  },
  orderStore: {
    fontSize: 14,
    color: '#999',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    gap: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  orderDetails: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 12,
  },
  orderDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  orderDetailText: {
    fontSize: 14,
    color: '#999',
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#333',
    paddingTop: 12,
  },
  orderTotal: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  viewDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewDetailsText: {
    fontSize: 14,
    color: '#FFD700',
    fontWeight: '600',
  },
});
