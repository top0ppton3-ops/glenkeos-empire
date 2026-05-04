import React, { useState } from 'react';

type ServiceType = 'black_truck' | 'pool_party' | 'event_25_plus' | 'live_event' | 'concierge';
type PackageTier = 'standard' | 'premium' | 'elite';

interface BookingFormData {
  service_type: ServiceType | '';
  date: string;
  start_time: string;
  end_time: string;
  pickup_location: string;
  dropoff_location: string;
  party_size: number;
  music_preference: string;
  vibe: string;
  notes: string;
  package_tier: PackageTier;
}

export default function GoldKeyBookingPage() {
  const [formData, setFormData] = useState<BookingFormData>({
    service_type: '',
    date: '',
    start_time: '',
    end_time: '',
    pickup_location: '',
    dropoff_location: '',
    party_size: 1,
    music_preference: '',
    vibe: '',
    notes: '',
    package_tier: 'standard',
  });

  const [step, setStep] = useState(1); // 1: Service selection, 2: Details, 3: Package, 4: Confirmation

  const services = [
    {
      id: 'black_truck' as ServiceType,
      name: 'Black Truck Concierge',
      description: 'Luxury transportation with style',
      icon: '🚙',
      basePrice: 500,
    },
    {
      id: 'pool_party' as ServiceType,
      name: 'Pool Party',
      description: 'Full venue + staff + security',
      icon: '🏊',
      basePrice: 5000,
    },
    {
      id: 'event_25_plus' as ServiceType,
      name: 'Event 25+',
      description: 'Birthdays, corporate, nightlife',
      icon: '🎉',
      basePrice: 3000,
    },
    {
      id: 'live_event' as ServiceType,
      name: 'Live Event',
      description: 'Concerts, shows, VIP access',
      icon: '🎤',
      basePrice: 1000,
    },
    {
      id: 'concierge' as ServiceType,
      name: 'On-Demand Concierge',
      description: '24/7 personal assistant',
      icon: '🔑',
      basePrice: 200,
    },
  ];

  const packages = [
    {
      tier: 'standard' as PackageTier,
      name: 'Standard',
      multiplier: 1.0,
      description: 'Base service with standard inclusions',
      features: ['Base service', 'Standard staff', 'Email support'],
    },
    {
      tier: 'premium' as PackageTier,
      name: 'Premium',
      multiplier: 1.5,
      description: 'Enhanced service with priority support',
      features: [
        'Priority booking',
        'Enhanced service',
        'Dedicated coordinator',
        'Phone support 24/7',
        '1 complimentary upgrade',
      ],
    },
    {
      tier: 'elite' as PackageTier,
      name: 'Elite',
      multiplier: 2.5,
      description: 'White-glove service, red carpet treatment',
      features: [
        'White-glove service',
        '24/7 dedicated concierge',
        'Red carpet treatment',
        'Premium staff selection',
        'Unlimited upgrades',
        'Personal photographer',
      ],
    },
  ];

  const selectedService = services.find((s) => s.id === formData.service_type);
  const selectedPackage = packages.find((p) => p.tier === formData.package_tier);
  const estimatedPrice = selectedService && selectedPackage
    ? selectedService.basePrice * selectedPackage.multiplier
    : 0;

  const handleServiceSelect = (serviceType: ServiceType) => {
    setFormData({ ...formData, service_type: serviceType });
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // TODO: Call API to create booking
    // const response = await fetch('/api/goldkey/bookings', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({
    //     service_type: formData.service_type,
    //     date: formData.date,
    //     start_time: formData.start_time,
    //     end_time: formData.end_time,
    //     pickup_location: formData.pickup_location,
    //     dropoff_location: formData.dropoff_location || null,
    //     party_size: formData.party_size,
    //     preferences: {
    //       music: formData.music_preference,
    //       vibe: formData.vibe,
    //       notes: formData.notes,
    //     },
    //     package_tier: formData.package_tier,
    //   }),
    // });

    alert('Booking submitted! Status: PENDING_REVIEW\nA GoldKey coordinator will contact you within 24 hours.');
    // Reset form or redirect to bookings page
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-yellow-600 to-yellow-500 text-white p-8 rounded-lg">
        <h1 className="text-4xl font-bold mb-2">🔑 GoldKey Luxury Services</h1>
        <p className="text-yellow-100">Your Kingsman-style concierge experience</p>
      </div>

      {/* Progress Steps */}
      <div className="flex justify-between items-center">
        {['Service', 'Details', 'Package', 'Review'].map((label, index) => (
          <div key={label} className="flex items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                step > index + 1
                  ? 'bg-green-500 text-white'
                  : step === index + 1
                  ? 'bg-yellow-500 text-white'
                  : 'bg-gray-300 text-gray-600'
              }`}
            >
              {step > index + 1 ? '✓' : index + 1}
            </div>
            <span className="ml-2 text-sm font-medium">{label}</span>
            {index < 3 && <div className="w-16 h-1 bg-gray-300 mx-4"></div>}
          </div>
        ))}
      </div>

      {/* Step 1: Service Selection */}
      {step === 1 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <button
              key={service.id}
              onClick={() => handleServiceSelect(service.id)}
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition text-left border-2 border-transparent hover:border-yellow-500"
            >
              <div className="text-5xl mb-4">{service.icon}</div>
              <h3 className="text-xl font-bold mb-2">{service.name}</h3>
              <p className="text-gray-600 mb-4">{service.description}</p>
              <p className="text-yellow-600 font-bold">From ${service.basePrice.toLocaleString()}</p>
            </button>
          ))}
        </div>
      )}

      {/* Step 2: Booking Details */}
      {step === 2 && (
        <form onSubmit={(e) => { e.preventDefault(); setStep(3); }} className="bg-white p-8 rounded-lg shadow-md space-y-6">
          <h2 className="text-2xl font-bold">Booking Details</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Party Size</label>
              <input
                type="number"
                required
                min="1"
                max="500"
                value={formData.party_size}
                onChange={(e) => setFormData({ ...formData, party_size: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
              <input
                type="time"
                required
                value={formData.start_time}
                onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">End Time</label>
              <input
                type="time"
                required
                value={formData.end_time}
                onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Pickup Location</label>
              <input
                type="text"
                required
                placeholder="123 Main St, City, State"
                value={formData.pickup_location}
                onChange={(e) => setFormData({ ...formData, pickup_location: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Dropoff Location (optional)</label>
              <input
                type="text"
                placeholder="456 Oak Ave, City, State"
                value={formData.dropoff_location}
                onChange={(e) => setFormData({ ...formData, dropoff_location: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Music Preference</label>
              <select
                value={formData.music_preference}
                onChange={(e) => setFormData({ ...formData, music_preference: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              >
                <option value="">Select genre</option>
                <option value="hip-hop">Hip Hop</option>
                <option value="r&b">R&B</option>
                <option value="jazz">Jazz</option>
                <option value="electronic">Electronic</option>
                <option value="rock">Rock</option>
                <option value="mixed">Mixed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Vibe</label>
              <select
                value={formData.vibe}
                onChange={(e) => setFormData({ ...formData, vibe: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              >
                <option value="">Select vibe</option>
                <option value="luxury">Luxury</option>
                <option value="party">Party</option>
                <option value="intimate">Intimate</option>
                <option value="corporate">Corporate</option>
                <option value="wild">Wild</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Special Requests / Notes</label>
            <textarea
              rows={4}
              placeholder="Dress code all black, birthday celebration, dietary restrictions, etc."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            ></textarea>
          </div>

          <div className="flex justify-between">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition"
            >
              Back
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-yellow-500 text-white rounded-lg font-medium hover:bg-yellow-600 transition"
            >
              Continue to Packages
            </button>
          </div>
        </form>
      )}

      {/* Step 3: Package Selection */}
      {step === 3 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Choose Your Package</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {packages.map((pkg) => (
              <div
                key={pkg.tier}
                className={`bg-white p-6 rounded-lg shadow-md cursor-pointer border-2 transition ${
                  formData.package_tier === pkg.tier
                    ? 'border-yellow-500 shadow-xl'
                    : 'border-transparent hover:border-yellow-300'
                }`}
                onClick={() => setFormData({ ...formData, package_tier: pkg.tier })}
              >
                <h3 className="text-2xl font-bold mb-2">{pkg.name}</h3>
                <p className="text-gray-600 mb-4">{pkg.description}</p>
                <p className="text-3xl font-bold text-yellow-600 mb-4">
                  ${selectedService ? (selectedService.basePrice * pkg.multiplier).toLocaleString() : 0}
                </p>
                <ul className="space-y-2">
                  {pkg.features.map((feature) => (
                    <li key={feature} className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="flex justify-between">
            <button
              onClick={() => setStep(2)}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition"
            >
              Back
            </button>
            <button
              onClick={() => setStep(4)}
              className="px-6 py-3 bg-yellow-500 text-white rounded-lg font-medium hover:bg-yellow-600 transition"
            >
              Review Booking
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Review & Submit */}
      {step === 4 && (
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md space-y-6">
          <h2 className="text-2xl font-bold">Review Your Booking</h2>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><span className="font-medium">Service:</span> {selectedService?.name}</div>
            <div><span className="font-medium">Package:</span> {selectedPackage?.name}</div>
            <div><span className="font-medium">Date:</span> {formData.date}</div>
            <div><span className="font-medium">Time:</span> {formData.start_time} - {formData.end_time}</div>
            <div><span className="font-medium">Party Size:</span> {formData.party_size}</div>
            <div><span className="font-medium">Location:</span> {formData.pickup_location}</div>
          </div>

          {formData.notes && (
            <div className="border-t pt-4">
              <p className="font-medium mb-2">Special Requests:</p>
              <p className="text-gray-600">{formData.notes}</p>
            </div>
          )}

          <div className="border-t pt-4">
            <div className="flex justify-between items-center text-2xl font-bold">
              <span>Estimated Total:</span>
              <span className="text-yellow-600">${estimatedPrice.toLocaleString()}</span>
            </div>
            <p className="text-sm text-gray-600 mt-2">Final price confirmed after review by coordinator</p>
          </div>

          <div className="flex justify-between">
            <button
              type="button"
              onClick={() => setStep(3)}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition"
            >
              Back
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-yellow-500 text-white rounded-lg font-medium hover:bg-yellow-600 transition"
            >
              Submit Booking
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
