'use server';

import { getDashboardTenantContext } from './actions';
import { prisma } from '@/lib/db/prisma';
import {
  fetchKeywordIntel,
  fetchBacklinkIntel,
  fetchAiCrawlerIntel,
  isVebApiConfigured,
} from '@/lib/providers/vebapi/service';
import { assertTenantHasCredits, chargeTenantCredits, InsufficientCreditsError } from '@/lib/credits/charge';

export async function getVebApiStatus() {
  return { configured: isVebApiConfigured() };
}

export async function researchKeyword(keyword: string, country = 'tr') {
  const { tenantId } = await getDashboardTenantContext();
  if (!isVebApiConfigured()) {
    return { success: false as const, error: 'VebAPI yapılandırılmamış.' };
  }
  try {
    await assertTenantHasCredits(tenantId, 'vebapi.keywordresearch');
    const result = await fetchKeywordIntel(keyword.trim(), country);
    const charge = await chargeTenantCredits({
      tenantId,
      featureKey: 'vebapi.keywordresearch',
      endpoint: 'dashboard/intelligence/keywords',
      cached: result.meta.cached,
    });
    return {
      success: true as const,
      ...result,
      creditsCharged: charge.charged,
    };
  } catch (err) {
    if (err instanceof InsufficientCreditsError) {
      return { success: false as const, error: err.message };
    }
    return {
      success: false as const,
      error: err instanceof Error ? err.message : 'Keyword araştırması başarısız.',
    };
  }
}

export async function loadSiteKeywordIntel(siteId: string, keyword: string, country = 'tr') {
  const { tenantId } = await getDashboardTenantContext();
  if (!isVebApiConfigured()) {
    return { success: false as const, error: 'VebAPI yapılandırılmamış.' };
  }

  const site = await prisma.site.findFirst({
    where: { id: siteId, tenantId },
    select: { domain: true },
  });
  if (!site) {
    return { success: false as const, error: 'Site bulunamadı.' };
  }

  try {
    const result = await fetchKeywordIntel(keyword.trim() || site.domain.split('.')[0], country);
    return { success: true as const, ...result };
  } catch (err) {
    return {
      success: false as const,
      error: err instanceof Error ? err.message : 'Keyword isteği başarısız.',
    };
  }
}

export async function loadSiteBacklinkIntel(siteId: string) {
  const { tenantId } = await getDashboardTenantContext();
  if (!isVebApiConfigured()) {
    return { success: false as const, error: 'VebAPI yapılandırılmamış.' };
  }

  const site = await prisma.site.findFirst({
    where: { id: siteId, tenantId },
    select: { domain: true },
  });
  if (!site) {
    return { success: false as const, error: 'Site bulunamadı.' };
  }

  try {
    const result = await fetchBacklinkIntel(site.domain);
    return { success: true as const, ...result };
  } catch (err) {
    return {
      success: false as const,
      error: err instanceof Error ? err.message : 'Backlink isteği başarısız.',
    };
  }
}

export async function loadAiCrawlerIntel(website: string) {
  await getDashboardTenantContext();
  if (!isVebApiConfigured()) {
    return { success: false as const, error: 'VebAPI yapılandırılmamış.' };
  }

  try {
    const result = await fetchAiCrawlerIntel(website);
    return { success: true as const, ...result };
  } catch (err) {
    return {
      success: false as const,
      error: err instanceof Error ? err.message : 'AI crawler kontrolü başarısız.',
    };
  }
}

export async function listTenantSitesForIntel() {
  const { tenantId } = await getDashboardTenantContext();
  return prisma.site.findMany({
    where: { tenantId },
    select: { id: true, name: true, domain: true },
    orderBy: { name: 'asc' },
  });
}
