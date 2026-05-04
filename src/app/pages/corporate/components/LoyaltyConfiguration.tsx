import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';

interface LoyaltyTier {
  tier_name: string;
  points_required: number;
  discount_percentage: number;
  benefits: string[];
  color: string;
}

interface LoyaltyReward {
  id: string;
  reward_name: string;
  points_cost: number;
  description: string;
  reward_type: 'discount' | 'free_item' | 'upgrade' | 'special_access';
  active: boolean;
  expiry_days?: number;
}

interface LoyaltySettings {
  points_per_dollar: number;
  welcome_bonus: number;
  birthday_bonus: number;
  referral_bonus: number;
  review_bonus: number;
  points_expiry_days: number;
  tier_downgrade_enabled: boolean;
}

export default function LoyaltyConfiguration() {
  const [selectedBrand, setSelectedBrand] = useState<string>('ghetto-eats');
  const [settings, setSettings] = useState<LoyaltySettings>({
    points_per_dollar: 10,
    welcome_bonus: 100,
    birthday_bonus: 500,
    referral_bonus: 250,
    review_bonus: 50,
    points_expiry_days: 365,
    tier_downgrade_enabled: false,
  });
  const [tiers, setTiers] = useState<LoyaltyTier[]>([
    {
      tier_name: 'Standard',
      points_required: 0,
      discount_percentage: 0,
      benefits: ['Earn points on purchases', 'Birthday bonus'],
      color: '#gray',
    },
    {
      tier_name: 'Bronze',
      points_required: 500,
      discount_percentage: 5,
      benefits: ['5% discount', 'Early access to promotions', 'Birthday bonus'],
      color: '#cd7f32',
    },
    {
      tier_name: 'Silver',
      points_required: 2000,
      discount_percentage: 10,
      benefits: ['10% discount', 'Free delivery', 'Priority support', 'Birthday bonus'],
      color: '#c0c0c0',
    },
    {
      tier_name: 'Gold',
      points_required: 5000,
      discount_percentage: 15,
      benefits: ['15% discount', 'Free delivery', 'Exclusive menu items', 'VIP events', 'Birthday bonus'],
      color: '#ffd700',
    },
    {
      tier_name: 'Platinum',
      points_required: 10000,
      discount_percentage: 20,
      benefits: ['20% discount', 'Free delivery', 'Concierge service', 'Private events', 'Birthday bonus'],
      color: '#e5e4e2',
    },
  ]);
  const [rewards, setRewards] = useState<LoyaltyReward[]>([]);
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [editingReward, setEditingReward] = useState<LoyaltyReward | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'settings' | 'tiers' | 'rewards'>('settings');

  const brands = [
    { id: 'ghetto-eats', name: 'Ghetto Eats' },
    { id: 'chic-on-chain', name: 'Chic-on-Chain' },
    { id: 'goldkey', name: 'GoldKey' },
  ];

  const [newReward, setNewReward] = useState({
    reward_name: '',
    points_cost: 0,
    description: '',
    reward_type: 'discount' as const,
    expiry_days: 30,
  });

  useEffect(() => {
    loadLoyaltyConfig();
  }, [selectedBrand]);

  const loadLoyaltyConfig = async () => {
    try {
      const { data: rewardsData, error } = await supabase
        .from('loyalty_rewards')
        .select('*')
        .eq('brand_id', selectedBrand)
        .order('points_cost', { ascending: true });

      if (error) throw error;
      setRewards(rewardsData || []);
      setLoading(false);
    } catch (error) {
      console.error('Error loading loyalty config:', error);
      setRewards([
        {
          id: '1',
          reward_name: '$5 Off Next Order',
          points_cost: 500,
          description: 'Get $5 off your next order',
          reward_type: 'discount',
          active: true,
          expiry_days: 30,
        },
        {
          id: '2',
          reward_name: 'Free Side Item',
          points_cost: 750,
          description: 'Choose any side item for free',
          reward_type: 'free_item',
          active: true,
          expiry_days: 30,
        },
      ]);
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      await supabase
        .from('brands')
        .update({
          settings: {
            loyalty: settings,
          },
        })
        .eq('brand_id', selectedBrand);

      alert('Loyalty settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings');
    }
  };

  const createReward = async () => {
    if (!newReward.reward_name || newReward.points_cost <= 0) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('loyalty_rewards')
        .insert({
          brand_id: selectedBrand,
          ...newReward,
          active: true,
        })
        .select()
        .single();

      if (error) throw error;

      setRewards([...rewards, data]);
      setShowRewardModal(false);
      setNewReward({
        reward_name: '',
        points_cost: 0,
        description: '',
        reward_type: 'discount',
        expiry_days: 30,
      });
      alert('Reward created successfully');
    } catch (error) {
      console.error('Error creating reward:', error);
      alert('Failed to create reward');
    }
  };

  const updateReward = async () => {
    if (!editingReward) return;

    try {
      await supabase
        .from('loyalty_rewards')
        .update(editingReward)
        .eq('id', editingReward.id);

      setRewards(rewards.map((r) => (r.id === editingReward.id ? editingReward : r)));
      setEditingReward(null);
      alert('Reward updated successfully');
    } catch (error) {
      console.error('Error updating reward:', error);
      alert('Failed to update reward');
    }
  };

  const deleteReward = async (rewardId: string) => {
    if (!confirm('Delete this reward?')) return;

    try {
      await supabase.from('loyalty_rewards').delete().eq('id', rewardId);
      setRewards(rewards.filter((r) => r.id !== rewardId));
      alert('Reward deleted');
    } catch (error) {
      console.error('Error deleting reward:', error);
    }
  };

  const updateTier = (index: number, field: keyof LoyaltyTier, value: any) => {
    const updatedTiers = [...tiers];
    updatedTiers[index] = { ...updatedTiers[index], [field]: value };
    setTiers(updatedTiers);
  };

  const addBenefit = (tierIndex: number) => {
    const benefit = prompt('Enter new benefit:');
    if (!benefit) return;
    const updatedTiers = [...tiers];
    updatedTiers[tierIndex].benefits.push(benefit);
    setTiers(updatedTiers);
  };

  const removeBenefit = (tierIndex: number, benefitIndex: number) => {
    const updatedTiers = [...tiers];
    updatedTiers[tierIndex].benefits = updatedTiers[tierIndex].benefits.filter((_, i) => i !== benefitIndex);
    setTiers(updatedTiers);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-xl text-gray-600">Loading loyalty configuration...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Loyalty Program Configuration</h1>
            <p className="text-gray-600">Configure brand-level loyalty settings, tiers, and rewards</p>
          </div>
          <select
            value={selectedBrand}
            onChange={(e) => setSelectedBrand(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            {brands.map((brand) => (
              <option key={brand.id} value={brand.id}>
                {brand.name}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-6 flex gap-2">
          {(['settings', 'tiers', 'rewards'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 rounded-lg font-medium ${
                activeTab === tab ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {activeTab === 'settings' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Loyalty Settings</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Points per Dollar Spent</label>
                <input
                  type="number"
                  value={settings.points_per_dollar}
                  onChange={(e) => setSettings({ ...settings, points_per_dollar: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">Customers earn this many points per $1 spent</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Welcome Bonus (Points)</label>
                <input
                  type="number"
                  value={settings.welcome_bonus}
                  onChange={(e) => setSettings({ ...settings, welcome_bonus: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">Points awarded when customer joins</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Birthday Bonus (Points)</label>
                <input
                  type="number"
                  value={settings.birthday_bonus}
                  onChange={(e) => setSettings({ ...settings, birthday_bonus: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Referral Bonus (Points)</label>
                <input
                  type="number"
                  value={settings.referral_bonus}
                  onChange={(e) => setSettings({ ...settings, referral_bonus: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">Points awarded for successful referral</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Review Bonus (Points)</label>
                <input
                  type="number"
                  value={settings.review_bonus}
                  onChange={(e) => setSettings({ ...settings, review_bonus: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">Points awarded for leaving a review</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Points Expiry (Days)</label>
                <input
                  type="number"
                  value={settings.points_expiry_days}
                  onChange={(e) => setSettings({ ...settings, points_expiry_days: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">Points expire after this many days</p>
              </div>

              <div className="md:col-span-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={settings.tier_downgrade_enabled}
                    onChange={(e) => setSettings({ ...settings, tier_downgrade_enabled: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-semibold text-gray-700">Enable Tier Downgrade</span>
                </label>
                <p className="text-xs text-gray-500 mt-1 ml-6">
                  Customers drop to lower tier if they don't maintain points threshold
                </p>
              </div>
            </div>

            <button
              onClick={saveSettings}
              className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Save Settings
            </button>
          </div>
        )}

        {activeTab === 'tiers' && (
          <div className="space-y-4">
            {tiers.map((tier, idx) => (
              <div key={idx} className="bg-white rounded-lg shadow p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Tier Name</label>
                    <input
                      type="text"
                      value={tier.tier_name}
                      onChange={(e) => updateTier(idx, 'tier_name', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Points Required</label>
                    <input
                      type="number"
                      value={tier.points_required}
                      onChange={(e) => updateTier(idx, 'points_required', parseInt(e.target.value) || 0)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Discount %</label>
                    <input
                      type="number"
                      value={tier.discount_percentage}
                      onChange={(e) => updateTier(idx, 'discount_percentage', parseInt(e.target.value) || 0)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-semibold text-gray-700">Benefits</label>
                    <button
                      onClick={() => addBenefit(idx)}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      + Add Benefit
                    </button>
                  </div>
                  <div className="space-y-2">
                    {tier.benefits.map((benefit, bIdx) => (
                      <div key={bIdx} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={benefit}
                          onChange={(e) => {
                            const updated = [...tiers];
                            updated[idx].benefits[bIdx] = e.target.value;
                            setTiers(updated);
                          }}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        />
                        <button
                          onClick={() => removeBenefit(idx, bIdx)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'rewards' && (
          <>
            <div className="mb-4 flex justify-end">
              <button
                onClick={() => setShowRewardModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                + Add Reward
              </button>
            </div>

            {rewards.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg shadow">
                <p className="text-xl text-gray-600">No rewards configured</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {rewards.map((reward) => (
                  <div key={reward.id} className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-lg font-bold text-gray-900">{reward.reward_name}</h3>
                      <div className={`px-2 py-1 rounded text-xs font-semibold ${reward.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {reward.active ? 'ACTIVE' : 'INACTIVE'}
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 mb-4">{reward.description}</p>

                    <div className="mb-4">
                      <div className="text-2xl font-bold text-blue-600">{reward.points_cost} pts</div>
                      <div className="text-xs text-gray-500">Points Cost</div>
                    </div>

                    <div className="mb-4">
                      <div className="text-xs text-gray-500">Type</div>
                      <div className="text-sm font-medium">{reward.reward_type.replace('_', ' ')}</div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingReward(reward)}
                        className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteReward(reward.id)}
                        className="flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {showRewardModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Create Reward</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Reward Name *</label>
                  <input
                    type="text"
                    value={newReward.reward_name}
                    onChange={(e) => setNewReward({ ...newReward, reward_name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                  <textarea
                    value={newReward.description}
                    onChange={(e) => setNewReward({ ...newReward, description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Points Cost *</label>
                  <input
                    type="number"
                    value={newReward.points_cost}
                    onChange={(e) => setNewReward({ ...newReward, points_cost: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Reward Type</label>
                  <select
                    value={newReward.reward_type}
                    onChange={(e) => setNewReward({ ...newReward, reward_type: e.target.value as any })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="discount">Discount</option>
                    <option value="free_item">Free Item</option>
                    <option value="upgrade">Upgrade</option>
                    <option value="special_access">Special Access</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Expiry (Days)</label>
                  <input
                    type="number"
                    value={newReward.expiry_days}
                    onChange={(e) => setNewReward({ ...newReward, expiry_days: parseInt(e.target.value) || 30 })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={createReward}
                  className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Create
                </button>
                <button
                  onClick={() => setShowRewardModal(false)}
                  className="flex-1 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {editingReward && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Edit Reward</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Reward Name</label>
                  <input
                    type="text"
                    value={editingReward.reward_name}
                    onChange={(e) => setEditingReward({ ...editingReward, reward_name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                  <textarea
                    value={editingReward.description}
                    onChange={(e) => setEditingReward({ ...editingReward, description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Points Cost</label>
                  <input
                    type="number"
                    value={editingReward.points_cost}
                    onChange={(e) => setEditingReward({ ...editingReward, points_cost: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={editingReward.active}
                      onChange={(e) => setEditingReward({ ...editingReward, active: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <span className="text-sm font-semibold text-gray-700">Active</span>
                  </label>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={updateReward}
                  className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditingReward(null)}
                  className="flex-1 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
