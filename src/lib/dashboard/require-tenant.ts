import { auth } from '@/auth';
import { prisma } from '@/lib/db/prisma';

export async function requireDashboardTenant() {
  const session = await auth();
  const impersonatedTenantId = session?.user.impersonatedTenantId;
  const effectiveTenantId = impersonatedTenantId ?? session?.user.tenantId;

  if (!effectiveTenantId) {
    if (process.env.NODE_ENV === 'development' || process.env.DASHBOARD_DEMO_MODE === 'true') {
      const seedTenant = await prisma.tenant.findUnique({ where: { slug: 'gmedya' } });
      if (seedTenant) {
        return { tenantId: seedTenant.id, readOnly: !!impersonatedTenantId };
      }
    }
    return null;
  }

  const tenant = await prisma.tenant.findUnique({ where: { id: effectiveTenantId } });
  if (!tenant) return null;

  return { tenantId: tenant.id, readOnly: !!impersonatedTenantId };
}

export function dashboardJsonError(message: string, status = 400) {
  return Response.json({ success: false, error: { message } }, { status });
}

export function dashboardJsonOk(data: unknown) {
  return Response.json({ success: true, data });
}
