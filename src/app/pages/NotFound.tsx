import { motion } from "motion/react";
import { Link } from "react-router";
import { Flame, Home, Menu } from "lucide-react";

export function NotFound() {
  return (
    <div className="min-h-screen bg-card flex items-center justify-center px-6">
      <div className="max-w-2xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
        >
          {/* 404 */}
          <div className="mb-8">
            <div className="text-9xl text-apollo-gold mb-4" style={{ fontWeight: 700 }}>
              404
            </div>
            <div className="flex items-center justify-center gap-4 mb-6">
              <Flame className="w-8 h-8 text-ares-red animate-pulse" />
              <Flame className="w-12 h-12 text-ares-red animate-pulse" />
              <Flame className="w-8 h-8 text-ares-red animate-pulse" />
            </div>
          </div>

          <h1 className="mb-6 tracking-[0.2em]" style={{ fontSize: '2.5rem', fontWeight: 700 }}>
            PATH NOT FOUND
          </h1>

          <p className="text-xl text-muted-foreground mb-4 leading-relaxed">
            Even the gods cannot find this realm
          </p>

          <p className="text-lg text-muted-foreground mb-12 leading-relaxed">
            The page you seek has been consumed by the Underworld, or perhaps it never existed at all.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/"
              className="px-10 py-4 bg-apollo-gold text-hades-black tracking-wider hover:bg-king-gold transition-all transform hover:scale-105 flex items-center justify-center gap-3"
              style={{ fontWeight: 600 }}
            >
              <Home className="w-5 h-5" />
              RETURN TO AGORA
            </Link>
            <Link
              to="/menu"
              className="px-10 py-4 border-2 border-apollo-gold text-apollo-gold tracking-wider hover:bg-apollo-gold/10 transition-all flex items-center justify-center gap-3"
              style={{ fontWeight: 600 }}
            >
              <Menu className="w-5 h-5" />
              VIEW PANTHEON
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
