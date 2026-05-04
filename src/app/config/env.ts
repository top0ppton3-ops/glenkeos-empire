/**
 * GlenKeos Environment Configuration
 * Validates and exports all environment variables
 * CRITICAL: Stripe only - NO PayPal
 */

export const config = {
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL || 'https://beswluhdxaphtitaovly.supabase.co',
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJlc3dsdWhkeGFwaHRpdGFvdmx5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ2NTUzNzIsImV4cCI6MjA1MDIzMTM3Mn0.qLcKz_g7pVHl8mz4G3wP6EJZwC-Sz8_JYu_sH3h_Uic',
  },
  stripe: {
    publishableKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '',
    environment: import.meta.env.VITE_STRIPE_ENVIRONMENT || 'test',
  },
  app: {
    mode: import.meta.env.MODE,
    isDevelopment: import.meta.env.DEV,
    isProduction: import.meta.env.PROD,
  },
} as const;

// Validate critical environment variables
export function validateEnvironment() {
  const errors: string[] = [];

  if (!config.supabase.url) {
    errors.push('VITE_SUPABASE_URL is required');
  }

  if (!config.supabase.anonKey) {
    errors.push('VITE_SUPABASE_ANON_KEY is required');
  }

  if (config.app.isProduction && !config.stripe.publishableKey) {
    console.warn('⚠️ Warning: VITE_STRIPE_PUBLISHABLE_KEY not set in production');
  }

  if (errors.length > 0) {
    throw new Error(
      `Environment validation failed:\n${errors.map(e => `  - ${e}`).join('\n')}`
    );
  }

  console.log('✅ Environment validated successfully');
  console.log('🔧 Mode:', config.app.mode);
  console.log('🗄️ Supabase:', config.supabase.url);
}
