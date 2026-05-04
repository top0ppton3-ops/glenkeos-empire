import { useState, useEffect } from 'react';
import { supabase } from '../../../config/supabase';

interface Booking {
  id: string;
  booking_number: string;
  service_id: string;
  service_name: string;
  scheduled_date: string;
  scheduled_time: string;
  duration_minutes: number;
  guest_count: number;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  special_requests: string | null;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  base_price: number;
  final_price: number;
  created_at: string;
  confirmed_at: string | null;
  notes: string | null;
}

type BookingFilter = 'today' | 'upcoming' | 'pending' | 'all';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  confirmed: 'bg-blue-100 text-blue-800 border-blue-300',
  in_progress: 'bg-purple-100 text-purple-800 border-purple-300',
  completed: 'bg-green-100 text-green-800 border-green-300',
  cancelled: 'bg-red-100 text-red-800 border-red-300',
};

export function BookingBoard() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [filter, setFilter] = useState<BookingFilter>('today');
  const [loading, setLoading] = useState(true);
  const [managerNotes, setManagerNotes] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');

  useEffect(() => {
    loadBookings();
  }, [filter]);

  const loadBookings = async () => {
    try {
      // Mock location ID - in production, get from manager's assigned location
      const locationId = 'mock-location-id';

      let query = supabase
        .from('goldkey_bookings')
        .select('*')
        .eq('location_id', locationId)
        .order('scheduled_date', { ascending: true })
        .order('scheduled_time', { ascending: true });

      // Apply filters
      const today = new Date().toISOString().split('T')[0];

      if (filter === 'today') {
        query = query.eq('scheduled_date', today);
      } else if (filter === 'upcoming') {
        query = query.gte('scheduled_date', today);
      } else if (filter === 'pending') {
        query = query.eq('status', 'pending');
      }

      const { data, error } = await query.limit(100);

      if (error && error.code !== 'PGRST116') throw error;

      if (data && data.length > 0) {
        const transformedBookings = data.map((booking: any) => ({
          ...booking,
          booking_number: booking.booking_number || `GK-${booking.id.slice(0, 8).toUpperCase()}`,
          final_price: booking.final_price || booking.base_price,
        }));
        setBookings(transformedBookings);
      } else {
        // Mock bookings for demo
        setBookings(generateMockBookings());
      }
    } catch (error) {
      console.error('Failed to load bookings:', error);
      setBookings(generateMockBookings());
    } finally {
      setLoading(false);
    }
  };

  const generateMockBookings = (): Booking[] => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return [
      {
        id: '1',
        booking_number: 'GK-1001',
        service_id: 'private-dining-small',
        service_name: 'Private Dining - Intimate',
        scheduled_date: today.toISOString().split('T')[0],
        scheduled_time: '19:00',
        duration_minutes: 180,
        guest_count: 4,
        contact_name: 'Robert Williams',
        contact_email: 'robert.w@example.com',
        contact_phone: '(555) 111-2222',
        special_requests: 'Anniversary celebration - need roses and champagne',
        status: 'confirmed',
        base_price: 500,
        final_price: 650,
        created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        confirmed_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        notes: 'VIP client - extra attention required',
      },
      {
        id: '2',
        booking_number: 'GK-1002',
        service_id: 'concierge-premium',
        service_name: 'Concierge Service - Premium',
        scheduled_date: today.toISOString().split('T')[0],
        scheduled_time: '14:00',
        duration_minutes: 120,
        guest_count: 1,
        contact_name: 'Jessica Martinez',
        contact_email: 'j.martinez@example.com',
        contact_phone: '(555) 333-4444',
        special_requests: 'Need help planning corporate event for 50 people',
        status: 'pending',
        base_price: 350,
        final_price: 350,
        created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        confirmed_at: null,
        notes: null,
      },
      {
        id: '3',
        booking_number: 'GK-1003',
        service_id: 'personal-chef',
        service_name: 'Personal Chef Service',
        scheduled_date: tomorrow.toISOString().split('T')[0],
        scheduled_time: '18:00',
        duration_minutes: 240,
        guest_count: 8,
        contact_name: 'David Thompson',
        contact_email: 'david.t@example.com',
        contact_phone: '(555) 555-6666',
        special_requests: 'Vegan menu preferred, 2 guests with nut allergies',
        status: 'confirmed',
        base_price: 800,
        final_price: 950,
        created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        confirmed_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        notes: 'Chef Marie assigned',
      },
    ];
  };

  const handleStatusChange = async (bookingId: string, newStatus: Booking['status']) => {
    try {
      const updateData: any = {
        status: newStatus,
        updated_at: new Date().toISOString(),
      };

      if (newStatus === 'confirmed' && !selectedBooking?.confirmed_at) {
        updateData.confirmed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('goldkey_bookings')
        .update(updateData)
        .eq('id', bookingId);

      if (error && error.code !== 'PGRST116') throw error;

      // Update local state
      setBookings(bookings.map(booking =>
        booking.id === bookingId
          ? { ...booking, status: newStatus, confirmed_at: updateData.confirmed_at || booking.confirmed_at }
          : booking
      ));

      if (selectedBooking?.id === bookingId) {
        setSelectedBooking({
          ...selectedBooking,
          status: newStatus,
          confirmed_at: updateData.confirmed_at || selectedBooking.confirmed_at,
        });
      }

      console.log(`Booking ${bookingId} status updated to ${newStatus}`);
    } catch (error) {
      console.error('Failed to update booking status:', error);
      alert('Failed to update booking status');
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedBooking) return;

    try {
      const { error } = await supabase
        .from('goldkey_bookings')
        .update({ notes: managerNotes })
        .eq('id', selectedBooking.id);

      if (error && error.code !== 'PGRST116') throw error;

      // Update local state
      const updatedBooking = { ...selectedBooking, notes: managerNotes };
      setBookings(bookings.map(b => b.id === selectedBooking.id ? updatedBooking : b));
      setSelectedBooking(updatedBooking);

      alert('Notes saved successfully');
    } catch (error) {
      console.error('Failed to save notes:', error);
      alert('Failed to save notes');
    }
  };

  const formatDateTime = (date: string, time: string) => {
    const dateObj = new Date(`${date}T${time}`);
    return dateObj.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const getBookingDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins}min`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}min`;
  };

  const todayCount = bookings.filter(b => b.scheduled_date === new Date().toISOString().split('T')[0]).length;
  const pendingCount = bookings.filter(b => b.status === 'pending').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-yellow-600"></div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gradient-to-br from-yellow-50 to-yellow-100 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow px-6 py-4">
        <div className="flex justify-between items-center">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-2xl">🔑</span>
              <h1 className="text-2xl font-bold">GoldKey Booking Board</h1>
            </div>
            <p className="text-sm text-gray-600">Premium service appointments & concierge bookings</p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 rounded ${viewMode === 'list' ? 'bg-yellow-600 text-white' : 'bg-gray-100 text-gray-600'}`}
            >
              📋 List
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-4 py-2 rounded ${viewMode === 'calendar' ? 'bg-yellow-600 text-white' : 'bg-gray-100 text-gray-600'}`}
            >
              📅 Calendar
            </button>
            <button
              onClick={loadBookings}
              className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
            >
              🔄 Refresh
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex space-x-2 mt-4">
          <button
            onClick={() => setFilter('today')}
            className={`px-4 py-2 rounded font-medium ${
              filter === 'today' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-600'
            }`}
          >
            Today ({todayCount})
          </button>
          <button
            onClick={() => setFilter('upcoming')}
            className={`px-4 py-2 rounded font-medium ${
              filter === 'upcoming' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'
            }`}
          >
            Upcoming
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded font-medium ${
              filter === 'pending' ? 'bg-orange-100 text-orange-800' : 'bg-gray-100 text-gray-600'
            }`}
          >
            Pending ({pendingCount})
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded font-medium ${
              filter === 'all' ? 'bg-gray-200 text-gray-800' : 'bg-gray-100 text-gray-600'
            }`}
          >
            All ({bookings.length})
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden flex">
        {/* Booking List */}
        <div className="w-2/3 overflow-y-auto p-6">
          {bookings.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <p className="text-gray-600">No bookings found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <div
                  key={booking.id}
                  onClick={() => {
                    setSelectedBooking(booking);
                    setManagerNotes(booking.notes || '');
                  }}
                  className={`bg-white rounded-lg shadow p-4 cursor-pointer transition-all ${
                    selectedBooking?.id === booking.id ? 'ring-2 ring-yellow-600' : 'hover:shadow-lg'
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-bold text-lg">{booking.booking_number}</h3>
                      <p className="text-sm text-gray-600">{booking.service_name}</p>
                      <p className="text-sm font-medium text-yellow-700">
                        {formatDateTime(booking.scheduled_date, booking.scheduled_time)}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-block px-3 py-1 rounded text-sm font-medium border ${statusColors[booking.status]}`}>
                        {booking.status.replace('_', ' ').toUpperCase()}
                      </span>
                      <p className="text-sm font-bold mt-1">${booking.final_price.toFixed(2)}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 text-sm">
                    <span className="text-gray-600">👤 {booking.contact_name}</span>
                    <span className="text-gray-600">⏱️ {getBookingDuration(booking.duration_minutes)}</span>
                    {booking.guest_count > 1 && (
                      <span className="text-gray-600">👥 {booking.guest_count} guests</span>
                    )}
                  </div>

                  {booking.special_requests && (
                    <div className="mt-2 bg-yellow-50 p-2 rounded text-sm">
                      <span className="font-medium">Special Requests:</span> {booking.special_requests}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Booking Details Panel */}
        <div className="w-1/3 bg-white border-l overflow-y-auto p-6">
          {selectedBooking ? (
            <div>
              <h2 className="text-xl font-bold mb-4">{selectedBooking.booking_number}</h2>

              {/* Service Info */}
              <div className="mb-6 bg-yellow-50 p-4 rounded">
                <h3 className="font-bold mb-2">{selectedBooking.service_name}</h3>
                <div className="space-y-1 text-sm">
                  <p className="font-medium">{formatDateTime(selectedBooking.scheduled_date, selectedBooking.scheduled_time)}</p>
                  <p className="text-gray-600">Duration: {getBookingDuration(selectedBooking.duration_minutes)}</p>
                  {selectedBooking.guest_count > 1 && (
                    <p className="text-gray-600">Guests: {selectedBooking.guest_count}</p>
                  )}
                </div>
              </div>

              {/* Contact Info */}
              <div className="mb-6">
                <h3 className="font-medium mb-2">Contact Information</h3>
                <div className="text-sm space-y-1">
                  <p>{selectedBooking.contact_name}</p>
                  <p className="text-gray-600">{selectedBooking.contact_email}</p>
                  <p className="text-gray-600">{selectedBooking.contact_phone}</p>
                </div>
              </div>

              {/* Special Requests */}
              {selectedBooking.special_requests && (
                <div className="mb-6 bg-yellow-50 p-3 rounded">
                  <h3 className="font-medium text-sm mb-1">Special Requests</h3>
                  <p className="text-sm">{selectedBooking.special_requests}</p>
                </div>
              )}

              {/* Manager Notes */}
              <div className="mb-6">
                <h3 className="font-medium mb-2">Manager Notes</h3>
                <textarea
                  value={managerNotes}
                  onChange={(e) => setManagerNotes(e.target.value)}
                  rows={4}
                  placeholder="Add internal notes about this booking..."
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-yellow-500"
                />
                <button
                  onClick={handleSaveNotes}
                  className="mt-2 w-full px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                >
                  💾 Save Notes
                </button>
              </div>

              {/* Pricing */}
              <div className="mb-6 bg-gray-50 p-3 rounded">
                <div className="flex justify-between text-sm mb-1">
                  <span>Base Price:</span>
                  <span>${selectedBooking.base_price.toFixed(2)}</span>
                </div>
                {selectedBooking.final_price !== selectedBooking.base_price && (
                  <div className="flex justify-between text-sm mb-1">
                    <span>Adjustments:</span>
                    <span>${(selectedBooking.final_price - selectedBooking.base_price).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold border-t pt-1">
                  <span>Total:</span>
                  <span>${selectedBooking.final_price.toFixed(2)}</span>
                </div>
              </div>

              {/* Status Actions */}
              <div className="mb-6">
                <h3 className="font-medium mb-2">Update Status</h3>
                <div className="space-y-2">
                  {selectedBooking.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleStatusChange(selectedBooking.id, 'confirmed')}
                        className="w-full px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        ✓ Confirm Booking
                      </button>
                      <button
                        onClick={() => handleStatusChange(selectedBooking.id, 'cancelled')}
                        className="w-full px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                      >
                        ✕ Decline
                      </button>
                    </>
                  )}
                  {selectedBooking.status === 'confirmed' && (
                    <button
                      onClick={() => handleStatusChange(selectedBooking.id, 'in_progress')}
                      className="w-full px-3 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                    >
                      ▶️ Start Service
                    </button>
                  )}
                  {selectedBooking.status === 'in_progress' && (
                    <button
                      onClick={() => handleStatusChange(selectedBooking.id, 'completed')}
                      className="w-full px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      ✓ Mark Complete
                    </button>
                  )}
                  {!['completed', 'cancelled'].includes(selectedBooking.status) && selectedBooking.status !== 'pending' && (
                    <button
                      onClick={() => handleStatusChange(selectedBooking.id, 'cancelled')}
                      className="w-full px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      ✕ Cancel Booking
                    </button>
                  )}
                </div>
              </div>

              {/* Contact Actions */}
              <div className="space-y-2">
                <a
                  href={`tel:${selectedBooking.contact_phone}`}
                  className="block w-full px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 text-center"
                >
                  📞 Call Customer
                </a>
                <a
                  href={`mailto:${selectedBooking.contact_email}`}
                  className="block w-full px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 text-center"
                >
                  ✉️ Email Customer
                </a>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-400 mt-20">
              <p>Select a booking to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
