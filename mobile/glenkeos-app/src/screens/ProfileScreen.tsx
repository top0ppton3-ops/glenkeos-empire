import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Switch,
} from 'react-native';
import {supabase} from '../lib/supabase';
import Icon from 'react-native-vector-icons/MaterialIcons';

export default function ProfileScreen({navigation}: any) {
  const [user, setUser] = useState<any>(null);
  const [customer, setCustomer] = useState<any>(null);
  const [loyaltyAccount, setLoyaltyAccount] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const {
        data: {user: authUser},
      } = await supabase.auth.getUser();

      if (!authUser) return;

      setUser(authUser);

      // Load customer data
      const {data: customerData} = await supabase
        .from('customers')
        .select('*')
        .eq('customer_id', authUser.id)
        .single();

      if (customerData) {
        setCustomer(customerData);
      }

      // Load loyalty account
      const {data: loyaltyData} = await supabase
        .from('loyalty_accounts')
        .select('*')
        .eq('customer_id', authUser.id)
        .single();

      if (loyaltyData) {
        setLoyaltyAccount(loyaltyData);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await supabase.auth.signOut();
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.container}>
      {/* Profile Header */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Icon name="person" size={48} color="#FFD700" />
        </View>
        <Text style={styles.userName}>
          {customer?.full_name || user?.email || 'Guest'}
        </Text>
        <Text style={styles.userEmail}>{user?.email}</Text>
      </View>

      {/* Loyalty Card */}
      {loyaltyAccount && (
        <View style={styles.loyaltyCard}>
          <View style={styles.loyaltyHeader}>
            <Icon name="stars" size={32} color="#FFD700" />
            <Text style={styles.loyaltyTitle}>Loyalty Rewards</Text>
          </View>
          <View style={styles.loyaltyStats}>
            <View style={styles.loyaltyStat}>
              <Text style={styles.loyaltyValue}>
                {loyaltyAccount.points_balance || 0}
              </Text>
              <Text style={styles.loyaltyLabel}>Points</Text>
            </View>
            <View style={styles.loyaltyDivider} />
            <View style={styles.loyaltyStat}>
              <Text style={styles.loyaltyValue}>
                {loyaltyAccount.tier || 'Bronze'}
              </Text>
              <Text style={styles.loyaltyLabel}>Tier</Text>
            </View>
            <View style={styles.loyaltyDivider} />
            <View style={styles.loyaltyStat}>
              <Text style={styles.loyaltyValue}>
                ${((loyaltyAccount.lifetime_points || 0) * 0.01).toFixed(0)}
              </Text>
              <Text style={styles.loyaltyLabel}>Lifetime Value</Text>
            </View>
          </View>
        </View>
      )}

      {/* Menu Sections */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>

        <TouchableOpacity style={styles.menuItem}>
          <Icon name="person-outline" size={24} color="#FFD700" />
          <Text style={styles.menuItemText}>Edit Profile</Text>
          <Icon name="chevron-right" size={24} color="#666" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Icon name="location-on" size={24} color="#FFD700" />
          <Text style={styles.menuItemText}>Saved Addresses</Text>
          <Icon name="chevron-right" size={24} color="#666" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Icon name="payment" size={24} color="#FFD700" />
          <Text style={styles.menuItemText}>Payment Methods</Text>
          <Icon name="chevron-right" size={24} color="#666" />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferences</Text>

        <View style={styles.menuItem}>
          <Icon name="notifications" size={24} color="#FFD700" />
          <Text style={styles.menuItemText}>Push Notifications</Text>
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            trackColor={{false: '#333', true: '#FFD700'}}
            thumbColor={notificationsEnabled ? '#FFF' : '#666'}
          />
        </View>

        <TouchableOpacity style={styles.menuItem}>
          <Icon name="language" size={24} color="#FFD700" />
          <Text style={styles.menuItemText}>Language</Text>
          <Text style={styles.menuItemValue}>English</Text>
          <Icon name="chevron-right" size={24} color="#666" />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Support</Text>

        <TouchableOpacity style={styles.menuItem}>
          <Icon name="help-outline" size={24} color="#FFD700" />
          <Text style={styles.menuItemText}>Help Center</Text>
          <Icon name="chevron-right" size={24} color="#666" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Icon name="chat" size={24} color="#FFD700" />
          <Text style={styles.menuItemText}>Contact Support</Text>
          <Icon name="chevron-right" size={24} color="#666" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Icon name="info-outline" size={24} color="#FFD700" />
          <Text style={styles.menuItemText}>About</Text>
          <Icon name="chevron-right" size={24} color="#666" />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Legal</Text>

        <TouchableOpacity style={styles.menuItem}>
          <Icon name="description" size={24} color="#FFD700" />
          <Text style={styles.menuItemText}>Terms of Service</Text>
          <Icon name="chevron-right" size={24} color="#666" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Icon name="privacy-tip" size={24} color="#FFD700" />
          <Text style={styles.menuItemText}>Privacy Policy</Text>
          <Icon name="chevron-right" size={24} color="#666" />
        </TouchableOpacity>
      </View>

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Icon name="logout" size={24} color="#F44336" />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>

      {/* App Version */}
      <Text style={styles.versionText}>Version 1.0.0</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A1A',
  },
  header: {
    alignItems: 'center',
    padding: 30,
    backgroundColor: '#2A2A2A',
  },
  avatarContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 14,
    color: '#999',
  },
  loyaltyCard: {
    backgroundColor: 'linear-gradient(135deg, #FFD700, #FFA500)',
    margin: 15,
    padding: 20,
    borderRadius: 15,
    backgroundColor: '#2A2A2A',
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  loyaltyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
  },
  loyaltyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  loyaltyStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  loyaltyStat: {
    alignItems: 'center',
  },
  loyaltyValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 5,
  },
  loyaltyLabel: {
    fontSize: 12,
    color: '#999',
  },
  loyaltyDivider: {
    width: 1,
    backgroundColor: '#333',
  },
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#999',
    textTransform: 'uppercase',
    paddingHorizontal: 15,
    paddingVertical: 10,
    letterSpacing: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2A2A2A',
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  menuItemText: {
    flex: 1,
    fontSize: 16,
    color: '#FFF',
    marginLeft: 15,
  },
  menuItemValue: {
    fontSize: 14,
    color: '#999',
    marginRight: 10,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2A2A2A',
    marginHorizontal: 15,
    marginTop: 30,
    marginBottom: 20,
    paddingVertical: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#F44336',
    gap: 10,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F44336',
  },
  versionText: {
    textAlign: 'center',
    fontSize: 12,
    color: '#666',
    paddingVertical: 20,
  },
});
