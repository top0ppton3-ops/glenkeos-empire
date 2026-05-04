import { Link } from "lucide-react";

interface BrandChainProps {
  brand: "chic-on-chain" | "ghetto-eats";
  size?: "sm" | "md" | "lg";
  showFull?: boolean;
}

export function BrandChain({ brand, size = "md", showFull = true }: BrandChainProps) {
  const sizes = {
    sm: { text: "text-sm", gap: "gap-1.5", icon: "w-3 h-3" },
    md: { text: "text-lg", gap: "gap-2", icon: "w-4 h-4" },
    lg: { text: "text-2xl", gap: "gap-3", icon: "w-5 h-5" }
  };

  const s = sizes[size];

  if (brand === "chic-on-chain") {
    return (
      <div className={`flex items-center ${s.gap} tracking-[0.2em]`} style={{ fontWeight: 500 }}>
        <span style={{ color: 'var(--b1-gold-minimal)' }}>COC</span>
        <Link className={s.icon} style={{ color: 'var(--b1-gold-trim)' }} />
        {showFull && (
          <>
            <span>CHIC</span>
            <Link className={s.icon} style={{ color: 'var(--b1-gold-trim)' }} />
            <span style={{ color: 'var(--b1-gold-minimal)' }}>ON-CHAIN</span>
          </>
        )}
        {!showFull && (
          <span style={{ color: 'var(--b1-gold-minimal)' }}>CHIC ON-CHAIN</span>
        )}
      </div>
    );
  }

  if (brand === "ghetto-eats") {
    return (
      <div className={`flex items-center ${s.gap} tracking-[0.2em]`} style={{ fontWeight: 500 }}>
        <span style={{ color: 'var(--b1-gold-minimal)' }}>COC</span>
        <Link className={s.icon} style={{ color: 'var(--b1-gold-trim)' }} />
        {showFull && (
          <>
            <span>GHETTO</span>
            <Link className={s.icon} style={{ color: 'var(--b1-gold-trim)' }} />
            <span style={{ color: 'var(--b1-gold-minimal)' }}>EATS</span>
          </>
        )}
        {!showFull && (
          <span style={{ color: 'var(--b1-gold-minimal)' }}>GHETTO EATS</span>
        )}
      </div>
    );
  }

  return null;
}
