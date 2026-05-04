import { motion } from "motion/react";
import { MapPin, Clock, Phone, Navigation } from "lucide-react";

export function Locations() {
  const locations = [
    {
      id: 1,
      name: "Downtown Center",
      address: "123 Main Street",
      city: "Los Angeles, CA 90012",
      phone: "(555) 123-4567",
      hours: "Mon-Sun: 10:00 AM - 10:00 PM",
      pickup: true,
      delivery: true
    },
    {
      id: 2,
      name: "West Side Plaza",
      address: "456 Ocean Avenue",
      city: "Santa Monica, CA 90401",
      phone: "(555) 234-5678",
      hours: "Mon-Sun: 10:00 AM - 11:00 PM",
      pickup: true,
      delivery: true
    },
    {
      id: 3,
      name: "Valley Market",
      address: "789 Ventura Boulevard",
      city: "Sherman Oaks, CA 91403",
      phone: "(555) 345-6789",
      hours: "Mon-Sun: 9:00 AM - 10:00 PM",
      pickup: true,
      delivery: true
    },
    {
      id: 4,
      name: "East District",
      address: "321 Broadway",
      city: "Pasadena, CA 91101",
      phone: "(555) 456-7890",
      hours: "Mon-Sun: 10:00 AM - 9:00 PM",
      pickup: true,
      delivery: false
    }
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--b1-obsidian)' }}>
      {/* Header */}
      <section className="py-16 px-6" style={{ backgroundColor: 'var(--b1-black-marble)' }}>
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <div className="w-16 h-16 border mx-auto mb-6 flex items-center justify-center" style={{ borderColor: 'var(--b1-gold-trim)' }}>
              <MapPin className="w-8 h-8" style={{ color: 'var(--b1-gold-trim)' }} />
            </div>
            <h1 className="mb-4 tracking-[0.2em]" style={{ fontSize: '3rem', fontWeight: 500 }}>
              FIND A CHIC-ON-CHAIN NEAR YOU
            </h1>
            <p className="text-lg" style={{ color: 'var(--b1-neutral-gray)' }}>
              Search by city or ZIP to view hours, contact information, and available services.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Locations Grid */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {locations.map((location, index) => (
              <motion.div
                key={location.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="p-8 border"
                style={{ borderColor: 'var(--b1-border-subtle)', backgroundColor: 'var(--b1-obsidian-panel)' }}
              >
                <h3 className="mb-6 tracking-wider" style={{ fontSize: '1.5rem', fontWeight: 500 }}>
                  {location.name}
                </h3>

                <div className="space-y-4 mb-6">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--b1-gold-trim)' }} />
                    <div>
                      <div>{location.address}</div>
                      <div style={{ color: 'var(--b1-neutral-gray)' }}>{location.city}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5" style={{ color: 'var(--b1-gold-trim)' }} />
                    <div>{location.hours}</div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5" style={{ color: 'var(--b1-gold-trim)' }} />
                    <div>{location.phone}</div>
                  </div>
                </div>

                <div className="flex gap-3 mb-6">
                  {location.pickup && (
                    <div className="px-3 py-1 text-xs tracking-widest" style={{ backgroundColor: 'var(--b1-gold-minimal)', color: 'var(--b1-black-marble)' }}>
                      PICKUP
                    </div>
                  )}
                  {location.delivery && (
                    <div className="px-3 py-1 text-xs tracking-widest" style={{ backgroundColor: 'var(--b1-gold-minimal)', color: 'var(--b1-black-marble)' }}>
                      DELIVERY
                    </div>
                  )}
                </div>

                <button
                  className="w-full py-3 border tracking-wider transition-all flex items-center justify-center gap-2"
                  style={{ borderColor: 'var(--b1-gold-trim)', color: 'var(--b1-gold-trim)' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--b1-gold-minimal)';
                    e.currentTarget.style.color = 'var(--b1-black-marble)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = 'var(--b1-gold-trim)';
                  }}
                >
                  <Navigation className="w-4 h-4" />
                  GET DIRECTIONS
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
