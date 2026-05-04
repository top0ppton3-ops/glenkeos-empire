import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import {supabase} from '../lib/supabase';
import Icon from 'react-native-vector-icons/MaterialIcons';

export default function MenuScreen({route, navigation}: any) {
  const {brandId} = route.params;
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<Map<string, number>>(new Map());

  useEffect(() => {
    loadMenu();
  }, [brandId]);

  const loadMenu = async () => {
    try {
      const {data, error} = await supabase
        .from('menu_items')
        .select('*')
        .eq('brand_id', brandId)
        .eq('active', true);

      if (error) throw error;
      setMenuItems(data || []);
    } catch (error) {
      console.error('Error loading menu:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (itemId: string) => {
    const newCart = new Map(cart);
    newCart.set(itemId, (newCart.get(itemId) || 0) + 1);
    setCart(newCart);
  };

  const removeFromCart = (itemId: string) => {
    const newCart = new Map(cart);
    const currentQty = newCart.get(itemId) || 0;
    if (currentQty > 1) {
      newCart.set(itemId, currentQty - 1);
    } else {
      newCart.delete(itemId);
    }
    setCart(newCart);
  };

  const getCartTotal = () => {
    let total = 0;
    cart.forEach((qty, itemId) => {
      const item = menuItems.find(i => i.item_id === itemId);
      if (item) {
        total += item.base_price * qty;
      }
    });
    return total;
  };

  const getCartItemCount = () => {
    let count = 0;
    cart.forEach(qty => {
      count += qty;
    });
    return count;
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
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={28} color="#FFD700" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Menu</Text>
          <View style={{width: 28}} />
        </View>

        {menuItems.map(item => {
          const qty = cart.get(item.item_id) || 0;
          return (
            <View key={item.item_id} style={styles.menuItem}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.item_name}</Text>
                <Text style={styles.itemDescription}>{item.description}</Text>
                <View style={styles.itemMeta}>
                  <Text style={styles.itemPrice}>
                    ${(item.base_price / 100).toFixed(2)}
                  </Text>
                  {item.nutritional_info && (
                    <Text style={styles.itemCalories}>
                      {item.nutritional_info.calories} cal
                    </Text>
                  )}
                  <Text style={styles.itemTime}>{item.prep_time_minutes} min</Text>
                </View>
              </View>

              <View style={styles.itemActions}>
                {qty > 0 ? (
                  <View style={styles.quantityControl}>
                    <TouchableOpacity
                      onPress={() => removeFromCart(item.item_id)}
                      style={styles.quantityButton}>
                      <Icon name="remove" size={20} color="#FFD700" />
                    </TouchableOpacity>
                    <Text style={styles.quantityText}>{qty}</Text>
                    <TouchableOpacity
                      onPress={() => addToCart(item.item_id)}
                      style={styles.quantityButton}>
                      <Icon name="add" size={20} color="#FFD700" />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    onPress={() => addToCart(item.item_id)}
                    style={styles.addButton}>
                    <Icon name="add-shopping-cart" size={24} color="#000" />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          );
        })}
      </ScrollView>

      {getCartItemCount() > 0 && (
        <View style={styles.cartFooter}>
          <View style={styles.cartInfo}>
            <Text style={styles.cartItemCount}>
              {getCartItemCount()} {getCartItemCount() === 1 ? 'item' : 'items'}
            </Text>
            <Text style={styles.cartTotal}>
              ${(getCartTotal() / 100).toFixed(2)}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.checkoutButton}
            onPress={() => navigation.navigate('Checkout', {cart, menuItems})}>
            <Text style={styles.checkoutButtonText}>View Cart</Text>
            <Icon name="arrow-forward" size={20} color="#000" />
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
  scrollView: {
    flex: 1,
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
  menuItem: {
    flexDirection: 'row',
    backgroundColor: '#2A2A2A',
    marginHorizontal: 20,
    marginVertical: 10,
    padding: 15,
    borderRadius: 10,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 5,
  },
  itemDescription: {
    fontSize: 14,
    color: '#999',
    marginBottom: 10,
  },
  itemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  itemCalories: {
    fontSize: 12,
    color: '#666',
  },
  itemTime: {
    fontSize: 12,
    color: '#666',
  },
  itemActions: {
    justifyContent: 'center',
    marginLeft: 10,
  },
  addButton: {
    backgroundColor: '#FFD700',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#333',
    borderRadius: 22,
    paddingHorizontal: 5,
  },
  quantityButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFD700',
    paddingHorizontal: 12,
  },
  cartFooter: {
    backgroundColor: '#2A2A2A',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  cartInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  cartItemCount: {
    fontSize: 16,
    color: '#999',
  },
  cartTotal: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  checkoutButton: {
    backgroundColor: '#FFD700',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 10,
    gap: 10,
  },
  checkoutButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
});
