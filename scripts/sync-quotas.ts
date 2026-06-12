import { PrismaClient } from '@prisma/client';
import 'dotenv/config';

const prisma = new PrismaClient();

async function runQuotaSync() {
  console.log('=== STARTING TENANT CREDIT QUOTA RECALCULATION & SYNC ===');
  
  // 1. Fetch all tenants
  const tenants = await prisma.tenant.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      aiCreditUsed: true,
      aiCreditLimit: true,
    }
  });

  console.log(`Found ${tenants.length} tenants in the database.\n`);

  const now = new Date();
  const firstDayOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  console.log(`Recalculating quota usage since first day of the month: ${firstDayOfMonth.toISOString().split('T')[0]}\n`);

  for (const tenant of tenants) {
    console.log(`Processing Tenant: "${tenant.name}" (${tenant.slug})`);
    
    // 2. Sum QuotaUsage records for current month
    const aggregation = await prisma.quotaUsage.aggregate({
      where: {
        tenantId: tenant.id,
        date: {
          gte: firstDayOfMonth,
        },
      },
      _sum: {
        units: true,
      },
    });

    const totalUsed = aggregation._sum.units ?? 0;
    
    if (tenant.aiCreditUsed !== totalUsed) {
      console.log(`  -> mismatch detected! Database Cache: ${tenant.aiCreditUsed}, Recalculating from Logs: ${totalUsed}`);
      
      // 3. Update cached credit usage
      await prisma.tenant.update({
        where: { id: tenant.id },
        data: {
          aiCreditUsed: totalUsed,
        },
      });
      
      console.log(`  -> synced successfully!`);
    } else {
      console.log(`  -> in sync. Cached Usage: ${tenant.aiCreditUsed} matches calculated log total.`);
    }
    console.log(`----------------------------------------`);
  }

  console.log('\n=== QUOTA RECALCULATION & SYNC COMPLETE ===');
}

runQuotaSync()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
