export interface ProAvailability {
  available: boolean;
  apiKeyPresent: boolean;
  siteIdPresent: boolean;
  reason?: string;
}

/** Non-throwing Pro gate check for admin UI. */
export function getProAvailability(): ProAvailability {
  const apiKeyPresent = Boolean(process.env.GSEO_API_KEY ?? process.env.SEOSUITE_API_KEY);
  const siteIdPresent = Boolean(process.env.GSEO_SITE_ID ?? process.env.SEOSUITE_SITE_ID);

  if (apiKeyPresent && siteIdPresent) {
    return { available: true, apiKeyPresent, siteIdPresent };
  }

  const missing: string[] = [];
  if (!apiKeyPresent) missing.push('GSEO_API_KEY');
  if (!siteIdPresent) missing.push('GSEO_SITE_ID');

  return {
    available: false,
    apiKeyPresent,
    siteIdPresent,
    reason: `Missing ${missing.join(' and ')}`,
  };
}

/** Client-side Pro gate (checks public env vars only). */
export function getClientProAvailability(): ProAvailability {
  const apiKeyPresent = Boolean(process.env.NEXT_PUBLIC_GSEO_API_KEY);
  const siteIdPresent = Boolean(process.env.NEXT_PUBLIC_GSEO_SITE_ID);
  return {
    available: apiKeyPresent && siteIdPresent,
    apiKeyPresent,
    siteIdPresent,
    reason: apiKeyPresent && siteIdPresent ? undefined : 'Pro API not configured in client env',
  };
}
