'use server';

import { getDashboardTenantContext } from './actions';
import { prisma } from '@/lib/db/prisma';
import {
  isSeoCrawlAllowedDomain,
  isSeoCrawlIntelEnabled,
} from '@/lib/features/seocrawl-intel';
import {
  fetchGscDashboard,
  listSeoCrawlSiteLinks,
  SeoCrawlPropertyNotFoundError,
} from '@/lib/providers/seocrawl/service';
import { assertTenantHasCredits, chargeTenantCredits, InsufficientCreditsError } from '@/lib/credits/charge';

const GSC_FEATURE = 'seocrawl.gsc_dashboard';

const PILOT_DENIED =
  'SEOCrawl GSC şu an yalnızca pilot domainler için açık (EfesusStone). Genel kullanım kapalı.';

export async function getSeoCrawlStatus() {
  return {
    pilotEnabled: isSeoCrawlIntelEnabled(),
  };
}

export async function listGscSiteOptions() {
  if (!isSeoCrawlIntelEnabled()) {
    return [];
  }

  const { tenantId } = await getDashboardTenantContext();
  const sites = await prisma.site.findMany({
    where: { tenantId },
    select: { id: true, name: true, domain: true },
    orderBy: { name: 'asc' },
  });

  const pilotSites = sites.filter((site) => isSeoCrawlAllowedDomain(site.domain));
  const links = await listSeoCrawlSiteLinks(pilotSites.map((s) => s.domain));

  return pilotSites.map((site, index) => ({
    id: site.id,
    name: site.name,
    domain: site.domain,
    seocrawlLinked: links[index]?.linked ?? false,
    seocrawlPropertyUrl: links[index]?.propertyUrl ?? null,
  }));
}

export async function loadGscDashboard(siteId: string) {
  if (!isSeoCrawlIntelEnabled()) {
    return { success: false as const, error: PILOT_DENIED };
  }

  const { tenantId } = await getDashboardTenantContext();

  const site = await prisma.site.findFirst({
    where: { id: siteId, tenantId },
    select: { id: true, domain: true, name: true },
  });
  if (!site) {
    return { success: false as const, error: 'Site bulunamadı.' };
  }

  if (!isSeoCrawlAllowedDomain(site.domain)) {
    return { success: false as const, error: PILOT_DENIED };
  }

  try {
    await assertTenantHasCredits(tenantId, GSC_FEATURE);
    const result = await fetchGscDashboard(site.domain);
    const charge = await chargeTenantCredits({
      tenantId,
      siteId: site.id,
      featureKey: GSC_FEATURE,
      endpoint: 'dashboard/intelligence/gsc',
      cached: result.meta.cached,
    });

    return {
      success: true as const,
      siteName: site.name,
      domain: site.domain,
      ...result,
      creditsCharged: charge.charged,
    };
  } catch (err) {
    if (err instanceof InsufficientCreditsError) {
      return { success: false as const, error: err.message };
    }
    if (err instanceof SeoCrawlPropertyNotFoundError) {
      return {
        success: false as const,
        error: `${site.domain} için SEOCrawl projesi yok. SEOCrawl panelinde aynı domain ile proje oluşturun.`,
      };
    }
    return {
      success: false as const,
      error: err instanceof Error ? err.message : 'GSC verisi alınamadı.',
    };
  }
}
