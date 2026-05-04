import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, CreditCard, Bell, Shield, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface UserProfile {
  name: string;
  email: string;
  phone: string;
  avatar_url?: string;
  addresses: Address[];
  payment_methods: PaymentMethod[];
  preferences: Preferences;
}

interface Address {
  id: string;
  label: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  is_default: boolean;
}

interface PaymentMethod {
  id: string;
  type: 'card' | 'paypal';
  last_four?: string;
  brand?: string;
  expiry?: string;
  is_default: boolean;
}

interface Preferences {
  email_notifications: boolean;
  sms_notifications: boolean;
  marketing_emails: boolean;
  order_updates: boolean;
}

export default function ProfilePage() {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'profile' | 'addresses' | 'payments' | 'preferences'>('profile');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/user/profile');
      // const data = await response.json();

      // Mock profile data
      const mockProfile: UserProfile = {
        name: user?.profile?.name || 'Guest User',
        email: user?.email || 'guest@glenkeos.com',
        phone: '+1 (555) 123-4567',
        addresses: [
          {
            id: 'addr_1',
            label: 'Home',
            street: '123 Main Street, Apt 4B',
            city: 'Atlanta',
            state: 'GA',
            zip: '30301',
            is_default: true,
          },
          {
            id: 'addr_2',
            label: 'Work',
            street: '456 Business Ave, Suite 200',
            city: 'Atlanta',
            state: 'GA',
            zip: '30303',
            is_default: false,
          },
        ],
        payment_methods: [
          {
            id: 'pm_1',
            type: 'card',
            last_four: '4242',
            brand: 'Visa',
            expiry: '12/25',
            is_default: true,
          },
          {
            id: 'pm_2',
            type: 'paypal',
            is_default: false,
          },
        ],
        preferences: {
          email_notifications: true,
          sms_notifications: true,
          marketing_emails: false,
          order_updates: true,
        },
      };

      setProfile(mockProfile);
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePreference = (key: keyof Preferences) => {
    if (!profile) return;

    setProfile({
      ...profile,
      preferences: {
        ...profile.preferences,
        [key]: !profile.preferences[key],
      },
    });

    // TODO: Save to API
    // await fetch('/api/user/preferences', {
    //   method: 'PATCH',
    //   body: JSON.stringify({ [key]: !profile.preferences[key] }),
    // });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Failed to load profile</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Account Settings</h1>
        <button
          onClick={signOut}
          className="flex items-center gap-2 text-red-600 hover:text-red-700 font-medium"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
      </div>

      {/* Profile Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt={profile.name} className="w-20 h-20 rounded-full" />
            ) : (
              <User className="w-10 h-10 text-blue-600" />
            )}
          </div>
          <div>
            <h2 className="text-2xl font-bold">{profile.name}</h2>
            <p className="text-gray-600">{profile.email}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-4 border-b border-gray-200">
        {[
          { id: 'profile', label: 'Profile', icon: User },
          { id: 'addresses', label: 'Addresses', icon: MapPin },
          { id: 'payments', label: 'Payment Methods', icon: CreditCard },
          { id: 'preferences', label: 'Preferences', icon: Bell },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`pb-4 px-4 font-medium transition flex items-center gap-2 ${
              activeTab === tab.id
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <tab.icon className="w-5 h-5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg shadow-md p-6">
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold mb-4">Personal Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <div className="flex items-center gap-3 px-4 py-3 border border-gray-300 rounded-lg">
                  <User className="w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={profile.name}
                    className="flex-1 outline-none"
                    readOnly
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <div className="flex items-center gap-3 px-4 py-3 border border-gray-300 rounded-lg bg-gray-50">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={profile.email}
                    className="flex-1 outline-none bg-transparent"
                    readOnly
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                <div className="flex items-center gap-3 px-4 py-3 border border-gray-300 rounded-lg">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    value={profile.phone}
                    className="flex-1 outline-none"
                    readOnly
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
                Edit Profile
              </button>
              <button className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50">
                Change Password
              </button>
            </div>
          </div>
        )}

        {activeTab === 'addresses' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Saved Addresses</h2>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                Add Address
              </button>
            </div>
            <div className="space-y-4">
              {profile.addresses.map((address) => (
                <div
                  key={address.id}
                  className={`border rounded-lg p-4 ${
                    address.is_default ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-gray-400 mt-1" />
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{address.label}</h3>
                          {address.is_default && (
                            <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="text-gray-700">{address.street}</p>
                        <p className="text-gray-600">
                          {address.city}, {address.state} {address.zip}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button className="text-blue-600 hover:text-blue-700 text-sm">Edit</button>
                      <button className="text-red-600 hover:text-red-700 text-sm">Delete</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'payments' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Payment Methods</h2>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                Add Payment Method
              </button>
            </div>
            <div className="space-y-4">
              {profile.payment_methods.map((method) => (
                <div
                  key={method.id}
                  className={`border rounded-lg p-4 ${
                    method.is_default ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CreditCard className="w-6 h-6 text-gray-400" />
                      <div>
                        {method.type === 'card' ? (
                          <>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold">
                                {method.brand} •••• {method.last_four}
                              </h3>
                              {method.is_default && (
                                <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded">
                                  Default
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600">Expires {method.expiry}</p>
                          </>
                        ) : (
                          <>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold">PayPal</h3>
                              {method.is_default && (
                                <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded">
                                  Default
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600">{profile.email}</p>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {!method.is_default && (
                        <button className="text-blue-600 hover:text-blue-700 text-sm">
                          Set as Default
                        </button>
                      )}
                      <button className="text-red-600 hover:text-red-700 text-sm">Remove</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'preferences' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold mb-4">Notification Preferences</h2>
            <div className="space-y-4">
              {[
                {
                  key: 'order_updates' as keyof Preferences,
                  label: 'Order Updates',
                  description: 'Get notified about order status changes',
                  icon: Bell,
                },
                {
                  key: 'email_notifications' as keyof Preferences,
                  label: 'Email Notifications',
                  description: 'Receive email notifications',
                  icon: Mail,
                },
                {
                  key: 'sms_notifications' as keyof Preferences,
                  label: 'SMS Notifications',
                  description: 'Receive text message notifications',
                  icon: Phone,
                },
                {
                  key: 'marketing_emails' as keyof Preferences,
                  label: 'Marketing Emails',
                  description: 'Receive promotional offers and updates',
                  icon: Mail,
                },
              ].map((pref) => (
                <div key={pref.key} className="flex items-center justify-between py-4 border-b">
                  <div className="flex items-start gap-3">
                    <pref.icon className="w-5 h-5 text-gray-400 mt-1" />
                    <div>
                      <h3 className="font-semibold">{pref.label}</h3>
                      <p className="text-sm text-gray-600">{pref.description}</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={profile.preferences[pref.key]}
                      onChange={() => handleUpdatePreference(pref.key)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              ))}
            </div>

            <div className="pt-4">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Shield className="w-5 h-5 text-gray-400" />
                Security
              </h3>
              <div className="space-y-3">
                <button className="w-full text-left px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50">
                  Two-Factor Authentication
                </button>
                <button className="w-full text-left px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50">
                  Active Sessions
                </button>
                <button className="w-full text-left px-4 py-3 border border-red-300 text-red-700 rounded-lg hover:bg-red-50">
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
