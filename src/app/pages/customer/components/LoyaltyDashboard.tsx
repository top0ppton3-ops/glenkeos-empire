import { useState, useEffect } from 'react';
import { supabase } from '../../../config/supabase';

interface LoyaltyStats {
  points_balance: number;
  tier: 'standard' | 'bronze' | 'silver' | 'gold' | 'platinum';
  lifetime_points_earned: number;
  total_orders: number;
  total_spent: number;
  points_to_next_tier: number;
  next_tier: string | null;
}

interface LoyaltyTransaction {
  id: string;
  points_change: number;
  transaction_type: 'earned' | 'redeemed' | 'expired' | 'bonus';
  description: string;
  created_at: string;
  order_id: string | null;
}

interface Reward {
  id: string;
  name: string;
  description: string;
  points_cost: number;
  reward_type: 'discount_percentage' | 'discount_fixed' | 'free_item';
  reward_value: number;
  active: boolean;
}

const tierBenefits = {
  standard: {
    name: 'Standard',
    color: 'gray',
    pointsPerDollar: 1,
    benefits: ['Earn 1 point per dollar', 'Birthday reward'],
    minSpend: 0,
  },
  bronze: {
    name: 'Bronze',
    color: 'orange',
    pointsPerDollar: 1.2,
    benefits: ['Earn 1.2 points per dollar', 'Birthday reward', 'Early access to promotions'],
    minSpend: 100,
  },
  silver: {
    name: 'Silver',
    color: 'gray',
    pointsPerDollar: 1.5,
    benefits: ['Earn 1.5 points per dollar', 'Birthday reward', 'Early access', 'Free delivery on orders $20+'],
    minSpend: 500,
  },
  gold: {
    name: 'Gold',
    color: 'yellow',
    pointsPerDollar: 2,
    benefits: ['Earn 2 points per dollar', 'Birthday reward', 'Early access', 'Free delivery', 'VIP support'],
    minSpend: 1500,
  },
  platinum: {
    name: 'Platinum',
    color: 'purple',
    pointsPerDollar: 3,
    benefits: ['Earn 3 points per dollar', 'All Gold benefits', 'Exclusive menu items', 'Priority reservations'],
    minSpend: 5000,
  },
};

export function LoyaltyDashboard() {
  const [stats, setStats] = useState<LoyaltyStats | null>(null);
  const [transactions, setTransactions] = useState<LoyaltyTransaction[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'rewards' | 'history'>('overview');

  useEffect(() => {
    loadLoyaltyData();
  }, []);

  const loadLoyaltyData = async () => {
    try {
      // Mock user ID - in production, get from auth
      const userId = 'mock-user-id';

      // Load loyalty stats
      const { data: loyaltyData, error: loyaltyError } = await supabase
        .from('loyalty_accounts')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (loyaltyError && loyaltyError.code !== 'PGRST116') throw loyaltyError;

      if (loyaltyData) {
        // Calculate points to next tier
        const currentTier = loyaltyData.tier;
        const tierKeys = Object.keys(tierBenefits);
        const currentTierIndex = tierKeys.indexOf(currentTier);
        const nextTierKey = tierKeys[currentTierIndex + 1];

        const pointsToNext = nextTierKey
          ? tierBenefits[nextTierKey as keyof typeof tierBenefits].minSpend - loyaltyData.total_spent
          : 0;

        setStats({
          ...loyaltyData,
          points_to_next_tier: Math.max(0, pointsToNext),
          next_tier: nextTierKey ? tierBenefits[nextTierKey as keyof typeof tierBenefits].name : null,
        });
      } else {
        // Mock stats for demo
        setStats({
          points_balance: 1250,
          tier: 'silver',
          lifetime_points_earned: 3400,
          total_orders: 42,
          total_spent: 680,
          points_to_next_tier: 820,
          next_tier: 'Gold',
        });
      }

      // Load transaction history
      const { data: txData, error: txError } = await supabase
        .from('loyalty_transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (txError && txError.code !== 'PGRST116') throw txError;

      if (txData && txData.length > 0) {
        setTransactions(txData);
      } else {
        // Mock transaction history
        setTransactions([
          {
            id: '1',
            points_change: 45,
            transaction_type: 'earned',
            description: 'Order #1234 at Ghetto Eats Downtown',
            created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            order_id: 'order-1',
          },
          {
            id: '2',
            points_change: -500,
            transaction_type: 'redeemed',
            description: 'Redeemed: $5 Off Your Order',
            created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            order_id: null,
          },
          {
            id: '3',
            points_change: 100,
            transaction_type: 'bonus',
            description: 'Birthday Bonus Points!',
            created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
            order_id: null,
          },
        ]);
      }

      // Load available rewards
      const { data: rewardsData, error: rewardsError } = await supabase
        .from('loyalty_rewards')
        .select('*')
        .eq('active', true)
        .order('points_cost');

      if (rewardsError && rewardsError.code !== 'PGRST116') throw rewardsError;

      if (rewardsData && rewardsData.length > 0) {
        setRewards(rewardsData);
      } else {
        // Mock rewards catalog
        setRewards([
          {
            id: '1',
            name: '$2 Off Any Order',
            description: 'Instant discount on your next order',
            points_cost: 200,
            reward_type: 'discount_fixed',
            reward_value: 2,
            active: true,
          },
          {
            id: '2',
            name: '$5 Off Any Order',
            description: 'Instant discount on your next order',
            points_cost: 500,
            reward_type: 'discount_fixed',
            reward_value: 5,
            active: true,
          },
          {
            id: '3',
            name: 'Free Appetizer',
            description: 'Choose any appetizer on the house',
            points_cost: 750,
            reward_type: 'free_item',
            reward_value: 0,
            active: true,
          },
          {
            id: '4',
            name: '20% Off Entire Order',
            description: 'Maximum discount $20',
            points_cost: 1000,
            reward_type: 'discount_percentage',
            reward_value: 20,
            active: true,
          },
          {
            id: '5',
            name: 'Free Entree',
            description: 'Choose any entree on the house',
            points_cost: 1500,
            reward_type: 'free_item',
            reward_value: 0,
            active: true,
          },
        ]);
      }
    } catch (error) {
      console.error('Failed to load loyalty data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRedeemReward = async (rewardId: string, pointsCost: number) => {
    if (!stats || stats.points_balance < pointsCost) {
      alert('Insufficient points');
      return;
    }

    if (confirm(`Redeem this reward for ${pointsCost} points?`)) {
      // In production, call API to create redemption
      alert('Reward redeemed! Check your account for the promo code.');
      loadLoyaltyData();
    }
  };

  if (loading || !stats) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const tierInfo = tierBenefits[stats.tier];
  const tierColor = {
    gray: 'bg-gray-100 text-gray-800 border-gray-300',
    orange: 'bg-orange-100 text-orange-800 border-orange-300',
    yellow: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    purple: 'bg-purple-100 text-purple-800 border-purple-300',
  }[tierInfo.color];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Loyalty Rewards</h1>
          <p className="text-gray-600">Earn points, unlock rewards, and enjoy exclusive benefits</p>
        </div>

        {/* Tier Status Card */}
        <div className={`rounded-lg shadow-lg p-6 mb-6 border-2 ${tierColor}`}>
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-2xl font-bold mb-1">{tierInfo.name} Member</h2>
              <p className="text-sm opacity-80">Earning {tierInfo.pointsPerDollar}x points per dollar</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">{stats.points_balance}</div>
              <div className="text-sm opacity-80">Points Available</div>
            </div>
          </div>

          {stats.next_tier && (
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-2">
                <span>Progress to {stats.next_tier}</span>
                <span>${stats.points_to_next_tier.toFixed(0)} more to spend</span>
              </div>
              <div className="w-full bg-white bg-opacity-30 rounded-full h-3">
                <div
                  className="bg-white bg-opacity-70 h-3 rounded-full transition-all"
                  style={{
                    width: `${Math.min(100, ((tierBenefits[stats.next_tier.toLowerCase() as keyof typeof tierBenefits].minSpend - stats.points_to_next_tier) / tierBenefits[stats.next_tier.toLowerCase() as keyof typeof tierBenefits].minSpend) * 100)}%`,
                  }}
                ></div>
              </div>
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-600 mb-1">Lifetime Points</div>
            <div className="text-2xl font-bold text-blue-600">{stats.lifetime_points_earned.toLocaleString()}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-600 mb-1">Total Orders</div>
            <div className="text-2xl font-bold text-green-600">{stats.total_orders}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-600 mb-1">Total Spent</div>
            <div className="text-2xl font-bold text-purple-600">${stats.total_spent.toFixed(2)}</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b">
            <nav className="flex">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-6 py-3 font-medium ${
                  activeTab === 'overview' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'
                }`}
              >
                Benefits
              </button>
              <button
                onClick={() => setActiveTab('rewards')}
                className={`px-6 py-3 font-medium ${
                  activeTab === 'rewards' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'
                }`}
              >
                Rewards Catalog
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`px-6 py-3 font-medium ${
                  activeTab === 'history' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'
                }`}
              >
                Points History
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* Benefits Tab */}
            {activeTab === 'overview' && (
              <div>
                <h3 className="font-bold text-lg mb-4">Your {tierInfo.name} Benefits</h3>
                <ul className="space-y-2">
                  {tierInfo.benefits.map((benefit, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="text-green-600 mr-2">✓</span>
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-6 bg-blue-50 p-4 rounded">
                  <h4 className="font-medium mb-2">How to Earn Points</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Place orders and earn {tierInfo.pointsPerDollar}x points per dollar spent</li>
                    <li>• Get bonus points on your birthday</li>
                    <li>• Special promotions and events</li>
                    <li>• Referral bonuses</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Rewards Catalog Tab */}
            {activeTab === 'rewards' && (
              <div>
                <h3 className="font-bold text-lg mb-4">Available Rewards</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {rewards.map((reward) => {
                    const canAfford = stats.points_balance >= reward.points_cost;

                    return (
                      <div
                        key={reward.id}
                        className={`border-2 rounded-lg p-4 ${
                          canAfford ? 'border-blue-200 bg-blue-50' : 'border-gray-200 bg-gray-50'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-bold">{reward.name}</h4>
                          <div className="text-sm font-medium px-2 py-1 bg-white rounded">
                            {reward.points_cost} pts
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{reward.description}</p>
                        <button
                          onClick={() => handleRedeemReward(reward.id, reward.points_cost)}
                          disabled={!canAfford}
                          className={`w-full py-2 rounded font-medium ${
                            canAfford
                              ? 'bg-blue-600 text-white hover:bg-blue-700'
                              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          }`}
                        >
                          {canAfford ? 'Redeem' : `Need ${reward.points_cost - stats.points_balance} more points`}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Points History Tab */}
            {activeTab === 'history' && (
              <div>
                <h3 className="font-bold text-lg mb-4">Points History</h3>
                <div className="space-y-3">
                  {transactions.map((tx) => {
                    const isPositive = tx.points_change > 0;

                    return (
                      <div key={tx.id} className="flex justify-between items-center py-3 border-b">
                        <div className="flex-1">
                          <p className="font-medium">{tx.description}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(tx.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className={`font-bold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                          {isPositive ? '+' : ''}{tx.points_change} pts
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
