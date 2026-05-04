import { useState } from "react";
import { Link } from "react-router";
import { Crown, User, ChevronRight, Calendar, Users, MapPin, Car, Plane, Home as HomeIcon } from "lucide-react";
import { Card } from "../../components/core/Card";
import { Button } from "../../components/core/Button";
import { useCart } from "../../contexts/CartContext";
import { toast } from "react-hot-toast";

const EVENTS = {
  privateDinners: [
    {
      id: "gk-dinner-1",
      name: "Michelin Star Private Dining",
      description: "Award-winning chef prepares 7-course tasting menu in your venue of choice",
      price: 500000,
      image_url: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800",
      guests: "Up to 12",
      duration: "4 hours",
    },
    {
      id: "gk-dinner-2",
      name: "Rooftop Penthouse Experience",
      description: "Exclusive penthouse access with private sommelier and butler service",
      price: 350000,
      image_url: "https://images.unsplash.com/photo-1551218808-94e220e084d2?w=800",
      guests: "Up to 8",
      duration: "6 hours",
    },
    {
      id: "gk-dinner-3",
      name: "Yacht Sunset Dinner",
      description: "Private yacht charter with gourmet dining as you cruise the coast",
      price: 750000,
      image_url: "https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=800",
      guests: "Up to 20",
      duration: "8 hours",
    },
  ],
  sprinters: [
    {
      id: "gk-sprinter-1",
      name: "Executive Mercedes Sprinter",
      description: "Luxury Mercedes Sprinter with leather seating, bar, and entertainment system",
      price: 150000,
      image_url: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800",
      capacity: "14 passengers",
      duration: "Per day",
    },
    {
      id: "gk-sprinter-2",
      name: "VIP Party Bus",
      description: "Custom party bus with LED lighting, premium sound, and full bar",
      price: 200000,
      image_url: "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=800",
      capacity: "20 passengers",
      duration: "Per event",
    },
  ],
  pools: [
    {
      id: "gk-pool-1",
      name: "Infinity Pool Villa",
      description: "Private infinity pool overlooking the ocean with cabana service",
      price: 300000,
      image_url: "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800",
      capacity: "30 guests",
      duration: "Full day",
    },
    {
      id: "gk-pool-2",
      name: "Rooftop Pool Lounge",
      description: "Downtown rooftop pool with DJ, cocktail service, and skyline views",
      price: 250000,
      image_url: "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=800",
      capacity: "50 guests",
      duration: "4 hours",
    },
  ],
  airbnb: [
    {
      id: "gk-airbnb-1",
      name: "Beachfront Estate",
      description: "8-bedroom luxury beachfront estate with private beach access",
      price: 1500000,
      image_url: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800",
      bedrooms: "8 bedrooms",
      duration: "Per week",
    },
    {
      id: "gk-airbnb-2",
      name: "Mountain Ski Chalet",
      description: "Exclusive alpine chalet with ski-in/ski-out access and hot tub",
      price: 1200000,
      image_url: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800",
      bedrooms: "6 bedrooms",
      duration: "Per week",
    },
    {
      id: "gk-airbnb-3",
      name: "Urban Penthouse Suite",
      description: "Top-floor penthouse in the city's most exclusive building",
      price: 800000,
      image_url: "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=800",
      bedrooms: "4 bedrooms",
      duration: "Per week",
    },
  ],
  trips: [
    {
      id: "gk-trip-1",
      name: "Private Jet Wine Country Tour",
      description: "3-day private jet tour of world-class wineries with Michelin dining",
      price: 2500000,
      image_url: "https://images.unsplash.com/photo-1540962351504-03099e0a754b?w=800",
      duration: "3 days",
      includes: "Jet, hotels, all meals",
    },
    {
      id: "gk-trip-2",
      name: "Mediterranean Yacht Week",
      description: "7-day luxury yacht charter through the Greek islands",
      price: 5000000,
      image_url: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800",
      duration: "7 days",
      includes: "Crew, chef, all amenities",
    },
    {
      id: "gk-trip-3",
      name: "Safari & Spa Retreat",
      description: "5-day African safari with luxury lodge and spa treatments",
      price: 3500000,
      image_url: "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800",
      duration: "5 days",
      includes: "Flights, lodge, guides",
    },
  ],
};

type Section = keyof typeof EVENTS;

export function GoldKeyEvents() {
  const [activeSection, setActiveSection] = useState<Section>("privateDinners");
  const { addItem } = useCart();

  const handleBookEvent = (event: any) => {
    addItem({
      id: event.id,
      name: event.name,
      description: event.description,
      price: event.price,
      brand: 'goldkey',
      image_url: event.image_url,
      category: activeSection,
    });
    toast.success('Added to your booking request');
  };

  const sections = [
    { id: 'privateDinners', label: 'Private Dinners', icon: Users },
    { id: 'sprinters', label: 'Luxury Vehicles', icon: Car },
    { id: 'pools', label: 'Pool Venues', icon: MapPin },
    { id: 'airbnb', label: 'Estate Rentals', icon: HomeIcon },
    { id: 'trips', label: 'Curated Trips', icon: Plane },
  ] as const;

  return (
    <div className="min-h-screen"
      style={{
        background: 'linear-gradient(135deg, rgba(0,0,0,0.98), rgba(26,26,26,0.98))'
      }}
    >
      {/* Header */}
      <header className="backdrop-blur-md border-b sticky top-0 z-50"
        style={{
          background: 'rgba(0,0,0,0.9)',
          borderColor: 'var(--b1-gold-trim)'
        }}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-4">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full border-2 flex items-center justify-center"
                style={{
                  borderColor: 'var(--b1-gold-trim)',
                  background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.2), rgba(212, 175, 55, 0.05))'
                }}
              >
                <Crown className="w-6 h-6" style={{ color: 'var(--b1-gold-trim)' }} />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-wider" style={{ color: 'var(--b1-gold-trim)' }}>
                  GoldKey Events
                </h1>
                <p className="text-xs" style={{ color: 'var(--b1-gold-minimal)' }}>Luxury Event Hosting</p>
              </div>
            </Link>

            <div className="flex items-center gap-4">
              <Link to="/account" style={{ color: 'var(--b1-gold-minimal)' }} className="hover:opacity-80">
                <User className="w-6 h-6" />
              </Link>
              <Link to="/cart">
                <Button
                  className="font-bold tracking-wide"
                  style={{
                    background: 'linear-gradient(135deg, var(--b1-gold-trim), var(--b1-gold-minimal))',
                    color: 'var(--b1-black-marble)'
                  }}
                >
                  View Requests
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Section Navigation */}
      <div className="border-b" style={{ borderColor: 'var(--b1-gold-trim)' }}>
        <div className="container mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto py-2">
            {sections.map(section => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className="px-6 py-3 rounded-lg font-semibold whitespace-nowrap transition-all flex items-center gap-2"
                  style={{
                    background: activeSection === section.id
                      ? 'linear-gradient(135deg, var(--b1-gold-trim), var(--b1-gold-minimal))'
                      : 'transparent',
                    color: activeSection === section.id
                      ? 'var(--b1-black-marble)'
                      : 'var(--b1-gold-minimal)',
                    border: activeSection === section.id
                      ? 'none'
                      : '1px solid var(--b1-gold-trim)',
                  }}
                >
                  <Icon className="w-4 h-4" />
                  {section.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Hero */}
      <div className="py-12 border-b" style={{ borderColor: 'var(--b1-gold-trim)' }}>
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4 tracking-wide" style={{ color: 'var(--b1-gold-trim)' }}>
            {sections.find(s => s.id === activeSection)?.label}
          </h2>
          <p className="text-lg" style={{ color: 'var(--b1-gold-minimal)' }}>
            Curated luxury experiences tailored to perfection
          </p>
        </div>
      </div>

      {/* Events Grid */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {EVENTS[activeSection].map((event: any) => (
            <Card key={event.id} className="overflow-hidden border-2 hover:shadow-2xl transition-all group"
              style={{
                background: 'rgba(0,0,0,0.6)',
                borderColor: 'var(--b1-gold-trim)'
              }}
            >
              <div className="aspect-video overflow-hidden relative">
                <img
                  src={event.image_url}
                  alt={event.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute top-4 right-4 px-4 py-2 rounded-lg font-bold backdrop-blur-md"
                  style={{
                    background: 'rgba(212, 175, 55, 0.9)',
                    color: 'var(--b1-black-marble)'
                  }}
                >
                  ${(event.price / 100).toLocaleString()}
                </div>
              </div>

              <div className="p-6">
                <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--b1-gold-minimal)' }}>
                  {event.name}
                </h3>
                <p className="text-sm mb-4" style={{ color: 'var(--color-text-secondary)' }}>
                  {event.description}
                </p>

                <div className="space-y-2 mb-6 text-sm" style={{ color: 'var(--b1-gold-minimal)' }}>
                  {event.guests && (
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      <span>{event.guests}</span>
                    </div>
                  )}
                  {event.capacity && (
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      <span>{event.capacity}</span>
                    </div>
                  )}
                  {event.bedrooms && (
                    <div className="flex items-center gap-2">
                      <HomeIcon className="w-4 h-4" />
                      <span>{event.bedrooms}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{event.duration}</span>
                  </div>
                  {event.includes && (
                    <div className="flex items-center gap-2">
                      <ChevronRight className="w-4 h-4" />
                      <span className="text-xs">{event.includes}</span>
                    </div>
                  )}
                </div>

                <Button
                  onClick={() => handleBookEvent(event)}
                  className="w-full font-bold tracking-wide flex items-center justify-center gap-2"
                  style={{
                    background: 'linear-gradient(135deg, var(--b1-gold-trim), var(--b1-gold-minimal))',
                    color: 'var(--b1-black-marble)'
                  }}
                >
                  Request Booking
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t py-8" style={{ borderColor: 'var(--b1-gold-trim)' }}>
        <div className="container mx-auto px-4 text-center" style={{ color: 'var(--b1-gold-minimal)' }}>
          <p className="text-sm">All bookings subject to availability and approval</p>
          <p className="mt-2">© 2026 GoldKey Events. A GlenKeos Brand.</p>
        </div>
      </footer>
    </div>
  );
}
