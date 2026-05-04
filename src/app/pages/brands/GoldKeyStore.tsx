import { useState, useEffect } from "react";
import { Link } from "react-router";
import { Crown, User, Shield, Sparkles } from "lucide-react";
import { api } from "../../services/api";
import { Card } from "../../components/core/Card";
import { Button } from "../../components/core/Button";
import { Loader } from "../../components/feedback/Loader";

export function GoldKeyStore() {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isVIP, setIsVIP] = useState(false);

  useEffect(() => {
    loadServices();
    checkVIPStatus();
  }, []);

  const checkVIPStatus = () => {
    // Simulate VIP check - in production, check user's membership
    setIsVIP(false);
  };

  const loadServices = async () => {
    try {
      const data = await api.menuItems.list({ brand: 'goldkey' });
      setServices(data.items || [
        {
          id: "1",
          name: "Private Chef Experience",
          description: "Michelin-starred chef prepares a bespoke 7-course tasting menu in your home",
          price: 500000,
          category: "Culinary",
          image_url: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800",
          min_notice: "72 hours"
        },
        {
          id: "2",
          name: "Yacht Dining Cruise",
          description: "Private yacht charter with gourmet dining for up to 12 guests",
          price: 1500000,
          category: "Events",
          image_url: "https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=800",
          min_notice: "7 days"
        },
        {
          id: "3",
          name: "Winery Tour & Tasting",
          description: "Private helicopter tour of Napa Valley with exclusive tastings",
          price: 750000,
          category: "Experiences",
          image_url: "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=800",
          min_notice: "5 days"
        },
        {
          id: "4",
          name: "Penthouse Dining Suite",
          description: "Exclusive access to our rooftop penthouse with private sommelier",
          price: 350000,
          category: "Venues",
          image_url: "https://images.unsplash.com/photo-1551218808-94e220e084d2?w=800",
          min_notice: "48 hours"
        },
        {
          id: "5",
          name: "Rare Wine Collection",
          description: "Curated selection of vintage wines from our private cellar",
          price: 250000,
          category: "Wine",
          image_url: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800",
          min_notice: "24 hours"
        },
        {
          id: "6",
          name: "Global Culinary Journey",
          description: "Private jet tour of world-renowned restaurants over 7 days",
          price: 5000000,
          category: "Luxury Travel",
          image_url: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800",
          min_notice: "30 days"
        }
      ]);
    } catch (error) {
      console.error('Failed to load services:', error);
    } finally {
      setLoading(false);
    }
  };

  const requestInvitation = () => {
    alert("A GoldKey concierge will contact you within 24 hours to discuss membership eligibility.");
  };

  const categories = Array.from(new Set(services.map(item => item.category)));

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center"
        style={{
          background: 'linear-gradient(135deg, rgba(0,0,0,0.98), rgba(26,26,26,0.98))'
        }}
      >
        <Loader size="lg" />
      </div>
    );
  }

  if (!isVIP) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(0,0,0,0.98), rgba(26,26,26,0.98))'
        }}
      >
        {/* Ambient gold glow */}
        <div className="absolute inset-0 opacity-10"
          style={{
            background: `radial-gradient(circle at 50% 50%, var(--b1-gold-trim), transparent 70%)`
          }}
        />

        <div className="relative z-10 max-w-2xl mx-auto px-4 text-center">
          <div className="w-32 h-32 mx-auto mb-8 rounded-full border-4 flex items-center justify-center backdrop-blur-sm animate-pulse"
            style={{
              borderColor: 'var(--b1-gold-trim)',
              background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.1), rgba(212, 175, 55, 0.05))'
            }}
          >
            <Crown className="w-16 h-16" style={{ color: 'var(--b1-gold-trim)' }} />
          </div>

          <h1 className="text-5xl font-bold mb-6 tracking-wider" style={{ color: 'var(--b1-gold-trim)' }}>
            GoldKey
          </h1>

          <p className="text-xl mb-4" style={{ color: 'var(--b1-gold-minimal)' }}>
            Ultra-Premium Concierge Services
          </p>

          <p className="mb-8" style={{ color: 'var(--color-text-secondary)' }}>
            Access to GoldKey is by invitation only. Our bespoke services are reserved for a select clientele 
            who demand nothing less than absolute perfection in every detail.
          </p>

          <div className="grid md:grid-cols-3 gap-6 mb-12 text-left">
            <div className="p-6 rounded-lg border"
              style={{
                borderColor: 'var(--b1-gold-trim)',
                background: 'rgba(212, 175, 55, 0.05)'
              }}
            >
              <Shield className="w-8 h-8 mb-4" style={{ color: 'var(--b1-gold-trim)' }} />
              <h3 className="font-bold mb-2" style={{ color: 'var(--b1-gold-minimal)' }}>
                Discretion Assured
              </h3>
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                Complete privacy and confidentiality
              </p>
            </div>

            <div className="p-6 rounded-lg border"
              style={{
                borderColor: 'var(--b1-gold-trim)',
                background: 'rgba(212, 175, 55, 0.05)'
              }}
            >
              <Sparkles className="w-8 h-8 mb-4" style={{ color: 'var(--b1-gold-trim)' }} />
              <h3 className="font-bold mb-2" style={{ color: 'var(--b1-gold-minimal)' }}>
                Bespoke Experiences
              </h3>
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                Tailored to your exact preferences
              </p>
            </div>

            <div className="p-6 rounded-lg border"
              style={{
                borderColor: 'var(--b1-gold-trim)',
                background: 'rgba(212, 175, 55, 0.05)'
              }}
            >
              <Crown className="w-8 h-8 mb-4" style={{ color: 'var(--b1-gold-trim)' }} />
              <h3 className="font-bold mb-2" style={{ color: 'var(--b1-gold-minimal)' }}>
                24/7 Concierge
              </h3>
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                Personal concierge team at your service
              </p>
            </div>
          </div>

          <Button
            onClick={requestInvitation}
            className="px-12 py-4 rounded-lg font-bold tracking-wider text-lg transition-all hover:tracking-widest"
            style={{
              background: 'linear-gradient(135deg, var(--b1-gold-trim), var(--b1-gold-minimal))',
              color: 'var(--b1-black-marble)',
              boxShadow: '0 8px 32px rgba(212, 175, 55, 0.4)'
            }}
          >
            Request Invitation
          </Button>

          <p className="mt-6 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            Annual membership from $100,000
          </p>

          <Link to="/" className="inline-block mt-8 text-sm hover:underline" style={{ color: 'var(--b1-gold-minimal)' }}>
            ← Return to GlenKeos
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen"
      style={{
        background: 'linear-gradient(135deg, rgba(0,0,0,0.98), rgba(26,26,26,0.98))'
      }}
    >
      {/* Header */}
      <header className="backdrop-blur-md border-b sticky top-0 z-50"
        style={{
          background: 'rgba(0,0,0,0.8)',
          borderColor: 'var(--b1-gold-trim)'
        }}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-8">
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
                    GoldKey
                  </h1>
                  <p className="text-xs" style={{ color: 'var(--b1-gold-minimal)' }}>Concierge</p>
                </div>
              </Link>
              
              <nav className="hidden md:flex items-center gap-6 text-sm"
                style={{ color: 'var(--b1-gold-minimal)' }}
              >
                <Link to="/goldkey/concierge" className="hover:opacity-80 font-medium">Services</Link>
                <Link to="/goldkey/events" className="hover:opacity-80">Private Events</Link>
                <Link to="/goldkey/travel" className="hover:opacity-80">Travel</Link>
              </nav>
            </div>

            <div className="flex items-center gap-4">
              <Link to="/account" style={{ color: 'var(--b1-gold-minimal)' }} className="hover:opacity-80">
                <User className="w-6 h-6" />
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <div className="py-16 border-b" style={{ borderColor: 'var(--b1-gold-trim)' }}>
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4 tracking-wide" style={{ color: 'var(--b1-gold-trim)' }}>
            Curated Luxury Experiences
          </h2>
          <p className="text-lg" style={{ color: 'var(--b1-gold-minimal)' }}>
            Exceptional service, impeccable taste, unforgettable moments
          </p>
        </div>
      </div>

      {/* Services */}
      <div className="container mx-auto px-4 py-12">
        {categories.map(category => {
          const categoryItems = services.filter(item => item.category === category);

          return (
            <div key={category} className="mb-16">
              <h3 className="text-3xl font-bold mb-8 tracking-wide" style={{ color: 'var(--b1-gold-trim)' }}>
                {category}
              </h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {categoryItems.map(item => (
                  <Card key={item.id} className="overflow-hidden border-2 hover:shadow-2xl transition-all"
                    style={{
                      background: 'rgba(0,0,0,0.6)',
                      borderColor: 'var(--b1-gold-trim)'
                    }}
                  >
                    <div className="aspect-video overflow-hidden">
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="text-xl font-bold" style={{ color: 'var(--b1-gold-minimal)' }}>
                          {item.name}
                        </h4>
                      </div>
                      <p className="text-sm mb-4" style={{ color: 'var(--color-text-secondary)' }}>
                        {item.description}
                      </p>
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-lg font-bold" style={{ color: 'var(--b1-gold-trim)' }}>
                          ${(item.price / 100).toLocaleString()}
                        </span>
                        <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                          Notice: {item.min_notice}
                        </span>
                      </div>
                      <Button
                        className="w-full font-bold tracking-wide"
                        style={{
                          background: 'linear-gradient(135deg, var(--b1-gold-trim), var(--b1-gold-minimal))',
                          color: 'var(--b1-black-marble)'
                        }}
                      >
                        Request Service
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <footer className="border-t py-8" style={{ borderColor: 'var(--b1-gold-trim)' }}>
        <div className="container mx-auto px-4 text-center" style={{ color: 'var(--b1-gold-minimal)' }}>
          <p>© 2026 GoldKey. A GlenKeos Brand.</p>
        </div>
      </footer>
    </div>
  );
}
