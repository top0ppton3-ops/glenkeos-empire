import React, { useState, useEffect } from 'react';
import { Gift, Star, TrendingUp, Award, Zap, Crown } from 'lucide-react';

interface LoyaltyData {
  points: number;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  points_to_next_tier: number;
  lifetime_points: number;
  rewards_available: Reward[];
  recent_activity: Activity[];
}

interface Reward {
  id: string;
  name: string;
  description: string;
  points_required: number;
  brand: 'ghetto-eats' | 'chic-on-chain' | 'goldkey' | 'all';
  expiry_date?: string;
}

interface Activity {
  id: string;
  type: 'earned' | 'redeemed';
  points: number;
  description: string;
  date: string;
}

export default function LoyaltyPage() {
  const [loyaltyData, setLoyaltyData] = useState<LoyaltyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedBrand, setSelectedBrand] = useState<'all' | 'ghetto-eats' | 'chic-on-chain' | 'goldkey'>('all');

  useEffect(() => {
    loadLoyaltyData();
  }, []);

  const loadLoyaltyData = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/loyalty/balance');
      // const data = await response.json();

      // Mock loyalty data
      const mockData: LoyaltyData = {
        points: 2450,
        tier: 'gold',
        points_to_next_tier: 550,
        lifetime_points: 8750,
        rewards_available: [
          {
            id: 'r1',
            name: 'Free Wings 10pc',
            description: 'Redeem for any flavor wings at Ghetto Eats',
            points_required: 500,
            brand: 'ghetto-eats',
          },
          {
            id: 'r2',
            name: '$10 Off Order',
            description: 'Valid on orders $30+',
            points_required: 750,
            brand: 'all',
          },
          {
            id: 'r3',
            name: 'Free Appetizer',
            description: 'Any appetizer at Chic-on-Chain',
            points_required: 1000,
            brand: 'chic-on-chain',
          },
          {
            id: 'r4',
            name: '$25 Off Premium Dining',
            description: 'Valid at Chic-on-Chain locations',
            points_required: 1500,
            brand: 'chic-on-chain',
          },
          {
            id: 'r5',
            name: 'GoldKey Event Discount',
            description: '20% off any GoldKey experience',
            points_required: 3000,
            brand: 'goldkey',
            expiry_date: '2026-12-31',
          },
        ],
        recent_activity: [
          {
            id: 'a1',
            type: 'earned',
            points: 150,
            description: 'Order at Ghetto Eats - Hot Wings',
            date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: 'a2',
            type: 'earned',
            points: 500,
            description: 'Order at Chic-on-Chain - Dry-Aged Ribeye',
            date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: 'a3',
            type: 'redeemed',
            points: -750,
            description: 'Redeemed: $10 Off Order',
            date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: 'a4',
            type: 'earned',
            points: 200,
            description: 'Bonus: Friend Referral',
            date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
          },
        ],
      };

      setLoyaltyData(mockData);
    } catch (error) {
      console.error('Failed to load loyalty data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTierIcon = (tier: LoyaltyData['tier']) => {
    switch (tier) {
      case 'bronze':
        return <Award className="w-8 h-8 text-orange-600" />;
      case 'silver':
        return <Star className="w-8 h-8 text-gray-400" />;
      case 'gold':
        return <Crown className="w-8 h-8 text-yellow-500" />;
      case 'platinum':
        return <Zap className="w-8 h-8 text-purple-600" />;
    }
  };

  const getTierColor = (tier: LoyaltyData['tier']) => {
    switch (tier) {
      case 'bronze':
        return 'from-orange-500 to-orange-600';
      case 'silver':
        return 'from-gray-400 to-gray-500';
      case 'gold':
        return 'from-yellow-500 to-yellow-600';
      case 'platinum':
        return 'from-purple-500 to-purple-600';
    }
  };

  const getBrandColor = (brand: string) => {
    switch (brand) {
      case 'ghetto-eats':
        return 'bg-red-100 text-red-700';
      case 'chic-on-chain':
        return 'bg-purple-100 text-purple-700';
      case 'goldkey':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-blue-100 text-blue-700';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!loyaltyData) {
    return (
      <div className="text-center py-12">
        <Gift className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-medium text-gray-900 mb-2">No loyalty data</h3>
        <p className="text-gray-600">Start ordering to earn rewards!</p>
      </div>
    );
  }

  const filteredRewards = loyaltyData.rewards_available.filter(
    (reward) => selectedBrand === 'all' || reward.brand === selectedBrand || reward.brand === 'all'
  );

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Loyalty & Rewards</h1>

      {/* Tier Card */}
      <div className={`bg-gradient-to-r ${getTierColor(loyaltyData.tier)} text-white rounded-lg p-8 shadow-lg`}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            {getTierIcon(loyaltyData.tier)}
            <div>
              <p className="text-sm opacity-90">Current Tier</p>
              <h2 className="text-3xl font-bold capitalize">{loyaltyData.tier}</h2>
            </div>
          </div>
          <div className="text-right">
            <p className="text-4xl font-bold">{loyaltyData.points.toLocaleString()}</p>
            <p className="text-sm opacity-90">Points Available</p>
          </div>
        </div>

        {/* Progress to Next Tier */}
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span>Progress to Platinum</span>
            <span>{loyaltyData.points_to_next_tier} points to go</span>
          </div>
          <div className="w-full bg-white bg-opacity-30 rounded-full h-3">
            <div
              className="bg-white h-3 rounded-full transition-all"
              style={{
                width: `${((3000 - loyaltyData.points_to_next_tier) / 3000) * 100}%`,
              }}
            ></div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-6 h-6 text-green-600" />
            <h3 className="font-semibold">Lifetime Points</h3>
          </div>
          <p className="text-3xl font-bold">{loyaltyData.lifetime_points.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3 mb-2">
            <Gift className="w-6 h-6 text-blue-600" />
            <h3 className="font-semibold">Rewards Available</h3>
          </div>
          <p className="text-3xl font-bold">{loyaltyData.rewards_available.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3 mb-2">
            <Star className="w-6 h-6 text-yellow-500" />
            <h3 className="font-semibold">Tier Benefits</h3>
          </div>
          <p className="text-sm text-gray-600 mt-2">2x points on all orders</p>
          <p className="text-sm text-gray-600">Priority support</p>
        </div>
      </div>

      {/* Available Rewards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Available Rewards</h2>
          {/* Brand Filter */}
          <div className="flex gap-2">
            {['all', 'ghetto-eats', 'chic-on-chain', 'goldkey'].map((brand) => (
              <button
                key={brand}
                onClick={() => setSelectedBrand(brand as any)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition ${
                  selectedBrand === brand
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {brand === 'all' ? 'All' : brand.replace('-', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRewards.map((reward) => {
            const canAfford = loyaltyData.points >= reward.points_required;

            return (
              <div
                key={reward.id}
                className={`bg-white rounded-lg shadow-md p-6 ${
                  !canAfford ? 'opacity-60' : ''
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <Gift className="w-8 h-8 text-blue-600" />
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getBrandColor(reward.brand)}`}>
                    {reward.brand === 'all' ? 'All Brands' : reward.brand.replace('-', ' ').toUpperCase()}
                  </span>
                </div>

                <h3 className="font-bold text-lg mb-2">{reward.name}</h3>
                <p className="text-gray-600 text-sm mb-4">{reward.description}</p>

                <div className="flex items-center justify-between">
                  <span className="font-bold text-blue-600">{reward.points_required} pts</span>
                  <button
                    disabled={!canAfford}
                    className={`px-4 py-2 rounded-lg font-medium transition ${
                      canAfford
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {canAfford ? 'Redeem' : 'Not enough points'}
                  </button>
                </div>

                {reward.expiry_date && (
                  <p className="text-xs text-gray-500 mt-3">
                    Expires: {new Date(reward.expiry_date).toLocaleDateString()}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
        <div className="space-y-3">
          {loyaltyData.recent_activity.map((activity) => (
            <div key={activity.id} className="flex items-center justify-between py-3 border-b last:border-b-0">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    activity.type === 'earned' ? 'bg-green-100' : 'bg-red-100'
                  }`}
                >
                  {activity.type === 'earned' ? (
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  ) : (
                    <Gift className="w-5 h-5 text-red-600" />
                  )}
                </div>
                <div>
                  <p className="font-medium">{activity.description}</p>
                  <p className="text-sm text-gray-600">
                    {new Date(activity.date).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <span
                className={`font-bold ${
                  activity.type === 'earned' ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {activity.points > 0 ? '+' : ''}{activity.points} pts
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
