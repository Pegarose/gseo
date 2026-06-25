/**
 * Faz 2 — Platform intelligence (OpenSEO / Semrush tarzı).
 * Varsayılan: kapalı. SDK + WordPress tamamlanana kadar dashboard'da gösterilmez.
 *
 * Geliştirme / VebAPI denemesi için: GSEO_PLATFORM_INTEL_ENABLED=true
 */
export function isPlatformIntelEnabled(): boolean {
  return process.env.GSEO_PLATFORM_INTEL_ENABLED === 'true';
}
