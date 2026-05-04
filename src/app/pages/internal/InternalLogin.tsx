import { useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { Shield, Mail, Lock, Users, UserCog } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

export function InternalLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginType, setLoginType] = useState<'employee' | 'admin' | null>(null);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signIn(email, password);
      navigate("/internal");
    } catch (error) {
      console.error('Login failed:', error);
      alert('Login failed. Please check your credentials.');
    }
  };

  if (!loginType) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6" style={{ backgroundColor: 'var(--b1-black-marble)' }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="w-full max-w-4xl"
        >
          {/* Logo */}
          <div className="text-center mb-12">
            <div className="w-24 h-24 border mx-auto mb-8 flex items-center justify-center" style={{ borderColor: 'var(--b1-gold-trim)', backgroundColor: 'var(--b1-obsidian)' }}>
              <Shield className="w-12 h-12" style={{ color: 'var(--b1-gold-trim)' }} />
            </div>
            <h1 className="mb-3 tracking-[0.3em]" style={{ fontSize: '3rem', fontWeight: 600, color: 'var(--b1-gold-trim)' }}>
              COC
            </h1>
            <p className="text-xl tracking-wider mb-2" style={{ color: 'var(--b1-white-space)', fontWeight: 500 }}>
              Chain on Chic Command Center
            </p>
            <p className="text-sm tracking-wider" style={{ color: 'var(--b3-gold-micro)' }}>
              Select Your Access Level
            </p>
          </div>

          {/* Dual Entry Cards */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* Employee Access */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="p-8 border backdrop-blur-sm cursor-pointer"
              style={{ backgroundColor: 'var(--b1-obsidian)', borderColor: 'var(--b1-border-subtle)' }}
              onClick={() => setLoginType('employee')}
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 border rounded-full mb-6 flex items-center justify-center" style={{ borderColor: 'var(--b1-gold-trim)', backgroundColor: 'var(--b1-black-marble)' }}>
                  <Users className="w-8 h-8" style={{ color: 'var(--b1-gold-trim)' }} />
                </div>
                <h2 className="text-2xl tracking-wider mb-3" style={{ fontWeight: 600, color: 'var(--b1-white-space)' }}>
                  EMPLOYEE ACCESS
                </h2>
                <p className="text-sm tracking-wide mb-6" style={{ color: 'var(--b1-neutral-gray)' }}>
                  Day-to-day operations, order management, kitchen display, driver coordination
                </p>
                <div className="space-y-2 text-xs" style={{ color: 'var(--b3-gold-micro)' }}>
                  <div>• View assigned orders</div>
                  <div>• Update order status</div>
                  <div>• Manage deliveries</div>
                  <div>• Kitchen operations</div>
                </div>
                <div className="mt-8 px-6 py-3" style={{ backgroundColor: 'var(--b1-gold-minimal)', color: 'var(--b1-black-marble)', fontWeight: 600, letterSpacing: '0.1em' }}>
                  ENTER
                </div>
              </div>
            </motion.div>

            {/* Admin/Manager Access */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="p-8 border backdrop-blur-sm cursor-pointer"
              style={{ backgroundColor: 'var(--b1-obsidian)', borderColor: 'var(--b1-gold-trim)' }}
              onClick={() => setLoginType('admin')}
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 border rounded-full mb-6 flex items-center justify-center" style={{ borderColor: 'var(--b1-gold-trim)', backgroundColor: 'var(--b1-gold-minimal)' }}>
                  <UserCog className="w-8 h-8" style={{ color: 'var(--b1-obsidian)' }} />
                </div>
                <h2 className="text-2xl tracking-wider mb-3" style={{ fontWeight: 600, color: 'var(--b1-gold-trim)' }}>
                  ADMIN / MANAGER
                </h2>
                <p className="text-sm tracking-wide mb-6" style={{ color: 'var(--b1-neutral-gray)' }}>
                  Full operations oversight, analytics, compliance, staff management, system settings
                </p>
                <div className="space-y-2 text-xs" style={{ color: 'var(--b3-gold-micro)' }}>
                  <div>• Complete dashboard access</div>
                  <div>• Staff & driver management</div>
                  <div>• Analytics & reporting</div>
                  <div>• System configuration</div>
                </div>
                <div className="mt-8 px-6 py-3" style={{ backgroundColor: 'var(--b1-gold-trim)', color: 'var(--b1-obsidian)', fontWeight: 600, letterSpacing: '0.1em' }}>
                  ENTER
                </div>
              </div>
            </motion.div>
          </div>

          <div className="mt-8 text-center text-xs" style={{ color: 'var(--b1-neutral-gray)' }}>
            <p>Authorized personnel only. All access is logged and monitored.</p>
          </div>
        </motion.div>
      </div>
    );
  }

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
          <div className="w-20 h-20 border mx-auto mb-6 flex items-center justify-center" style={{ borderColor: 'var(--b1-gold-trim)', backgroundColor: 'var(--b1-obsidian)' }}>
            {loginType === 'employee' ? (
              <Users className="w-10 h-10" style={{ color: 'var(--b1-gold-trim)' }} />
            ) : (
              <UserCog className="w-10 h-10" style={{ color: 'var(--b1-gold-trim)' }} />
            )}
          </div>
          <h1 className="mb-2 tracking-[0.3em]" style={{ fontSize: '2.5rem', fontWeight: 600, color: 'var(--b1-gold-trim)' }}>
            COC
          </h1>
          <p className="text-sm tracking-wider mb-1" style={{ color: 'var(--b1-white-space)', fontWeight: 500 }}>
            {loginType === 'employee' ? 'Employee Access' : 'Admin / Manager Access'}
          </p>
          <button
            onClick={() => setLoginType(null)}
            className="text-xs tracking-wider hover:underline"
            style={{ color: 'var(--b3-gold-micro)' }}
          >
            ← Change Access Level
          </button>
        </div>

        {/* Login Form */}
        <div className="p-8 border backdrop-blur-sm" style={{ backgroundColor: 'var(--b1-obsidian)', borderColor: 'var(--b1-border-subtle)' }}>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm mb-2 tracking-wider" style={{ fontWeight: 500, color: 'var(--b1-white-space)' }}>
                Email Address
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
                  placeholder={loginType === 'employee' ? 'employee@coc.internal' : 'admin@coc.internal'}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm mb-2 tracking-wider" style={{ fontWeight: 500, color: 'var(--b1-white-space)' }}>
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
              className="w-full py-3 tracking-wider transition-all transform hover:scale-105"
              style={{
                backgroundColor: loginType === 'admin' ? 'var(--b1-gold-trim)' : 'var(--b1-gold-minimal)',
                color: 'var(--b1-black-marble)',
                fontWeight: 600,
                letterSpacing: '0.15em'
              }}
            >
              SIGN IN
            </button>
          </form>

          <div className="mt-6 pt-6 border-t text-xs" style={{ borderTopColor: 'var(--b1-border-subtle)', color: 'var(--b1-neutral-gray)' }}>
            <div className="mb-2">Quick Access (Dev):</div>
            {loginType === 'employee' ? (
              <div className="space-y-1">
                <div>kitchen@coc.internal - Kitchen Staff</div>
                <div>driver@coc.internal - Delivery Driver</div>
              </div>
            ) : (
              <div className="space-y-1">
                <div>admin@coc.internal - System Admin</div>
                <div>manager@coc.internal - Operations Manager</div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
