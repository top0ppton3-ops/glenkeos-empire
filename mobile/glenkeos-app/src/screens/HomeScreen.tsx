import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import {supabase} from '../lib/supabase';
import Icon from 'react-native-vector-icons/MaterialIcons';

export default function HomeScreen({navigation}: any) {
  const [brands, setBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBrands();
  }, []);

  const loadBrands = async () => {
    try {
      const {data, error} = await supabase
        .from('brands')
        .select('*')
        .eq('active', true);

      if (error) throw error;
      setBrands(data || []);
    } catch (error) {
      console.error('Error loading brands:', error);
    } finally {
      setLoading(false);
    }
  };

  const getBrandColor = (brandId: string) => {
    switch (brandId) {
      case 'COC':
        return '#FFD700';
      case 'GE':
        return '#FF6B35';
      case 'GK':
        return '#C9B037';
      default:
        return '#FFD700';
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Welcome to GlenKeos</Text>
        <Text style={styles.subtitle}>Select your brand</Text>
      </View>

      {brands.map(brand => (
        <TouchableOpacity
          key={brand.brand_id}
          style={[
            styles.brandCard,
            {borderLeftColor: getBrandColor(brand.brand_id)},
          ]}
          onPress={() => navigation.navigate('Menu', {brandId: brand.brand_id})}>
          <View style={styles.brandInfo}>
            <Text style={styles.brandName}>{brand.brand_name}</Text>
            <Text style={styles.brandDescription}>{brand.description}</Text>
            <View style={styles.brandTier}>
              <Icon
                name="star"
                size={16}
                color={getBrandColor(brand.brand_id)}
              />
              <Text style={styles.brandTierText}>{brand.brand_tier} Tier</Text>
            </View>
          </View>
          <Icon name="chevron-right" size={30} color="#666" />
        </TouchableOpacity>
      ))}

      <View style={styles.features}>
        <Text style={styles.featuresTitle}>Why GlenKeos?</Text>

        <View style={styles.featureItem}>
          <Icon name="verified" size={24} color="#FFD700" />
          <View style={styles.featureText}>
            <Text style={styles.featureName}>Premium Quality</Text>
            <Text style={styles.featureDescription}>
              Fortune-500 grade service
            </Text>
          </View>
        </View>

        <View style={styles.featureItem}>
          <Icon name="location-on" size={24} color="#FFD700" />
          <View style={styles.featureText}>
            <Text style={styles.featureName}>Real-time Tracking</Text>
            <Text style={styles.featureDescription}>
              GPS tracking for all deliveries
            </Text>
          </View>
        </View>

        <View style={styles.featureItem}>
          <Icon name="loyalty" size={24} color="#FFD700" />
          <View style={styles.featureText}>
            <Text style={styles.featureName}>Loyalty Rewards</Text>
            <Text style={styles.featureDescription}>
              Earn points with every order
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A1A',
  },
  header: {
    padding: 20,
    backgroundColor: '#2A2A2A',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#999',
  },
  brandCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2A2A2A',
    marginHorizontal: 20,
    marginVertical: 10,
    padding: 20,
    borderRadius: 10,
    borderLeftWidth: 5,
  },
  brandInfo: {
    flex: 1,
  },
  brandName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 5,
  },
  brandDescription: {
    fontSize: 14,
    color: '#999',
    marginBottom: 10,
  },
  brandTier: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandTierText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 5,
  },
  features: {
    padding: 20,
    marginTop: 20,
  },
  featuresTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  featureText: {
    marginLeft: 15,
    flex: 1,
  },
  featureName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 3,
  },
  featureDescription: {
    fontSize: 14,
    color: '#999',
  },
});
