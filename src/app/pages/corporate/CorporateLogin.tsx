import { useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { Building2, Mail, Lock } from "lucide-react";

export function CorporateLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // TODO: Integrate with Supabase Auth
    // For now, simple demo login
    setTimeout(() => {
      localStorage.setItem('corporate_user', JSON.stringify({
        email,
        name: email.split('@')[0],
        role: 'employee'
      }));
      navigate("/corporate/operations");
    }, 500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6" style={{ backgroundColor: 'var(--b1-black-marble)' }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 border mx-auto mb-6 flex items-center justify-center" style={{ borderColor: 'var(--b1-gold-trim)' }}>
            <Building2 className="w-10 h-10" style={{ color: 'var(--b1-gold-trim)' }} />
          </div>
          <h1 className="mb-2 tracking-[0.2em]" style={{ fontSize: '2rem', fontWeight: 500 }}>
            GlenKeos
          </h1>
          <p className="text-sm tracking-wider mb-1" style={{ color: 'var(--b1-white-space)' }}>
            Corporate Operations Portal
          </p>
          <p className="text-xs tracking-wider" style={{ color: 'var(--b3-gold-micro)' }}>
            Employee Access
          </p>
        </div>

        {/* Login Form */}
        <div className="p-8 border backdrop-blur-sm" style={{ backgroundColor: 'var(--b3-glass-white)', borderColor: 'var(--b3-glass-border)' }}>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm mb-2 tracking-wider" style={{ fontWeight: 500 }}>
                Employee Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--b1-neutral-gray)' }} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border outline-none transition-colors"
                  style={{
                    backgroundColor: 'var(--b1-black-marble)',
                    borderColor: 'var(--b1-border-subtle)',
                    color: 'var(--b1-white-space)'
                  }}
                  placeholder="your.name@glenkeos.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm mb-2 tracking-wider" style={{ fontWeight: 500 }}>
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--b1-neutral-gray)' }} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border outline-none transition-colors"
                  style={{
                    backgroundColor: 'var(--b1-black-marble)',
                    borderColor: 'var(--b1-border-subtle)',
                    color: 'var(--b1-white-space)'
                  }}
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 tracking-wider transition-all transform hover:scale-105 disabled:opacity-50"
              style={{ backgroundColor: 'var(--b1-gold-minimal)', color: 'var(--b1-black-marble)', fontWeight: 500 }}
            >
              {loading ? 'SIGNING IN...' : 'SIGN IN'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t text-center text-xs" style={{ borderTopColor: 'var(--b3-glass-border)', color: 'var(--b1-neutral-gray)' }}>
            <p>
              Authorized employees only. Contact IT for access issues.
            </p>
          </div>
        </div>

        {/* Quick Access (Dev Mode) */}
        <div className="mt-6 p-4 border text-xs" style={{ borderColor: 'var(--b1-border-subtle)', backgroundColor: 'var(--b1-obsidian-panel)' }}>
          <div className="mb-2" style={{ color: 'var(--b1-neutral-gray)' }}>Quick Access (Dev):</div>
          <div className="space-y-1" style={{ color: 'var(--b1-neutral-gray)' }}>
            <div>manager@glenkeos.com - Store Manager</div>
            <div>kitchen@glenkeos.com - Kitchen Staff</div>
            <div>driver@glenkeos.com - Delivery Driver</div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
