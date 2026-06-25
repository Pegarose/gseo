import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import 'dotenv/config';

const prisma = new PrismaClient();

function generateApiKey(prefix: 'sk_live_' | 'sk_test_') {
  const bytes = crypto.randomBytes(24).toString('hex');
  const rawKey = `gseo_${prefix.includes('test') ? 'test' : 'live'}_${bytes}`;
  const hashedKey = crypto.createHash('sha256').update(rawKey).digest('hex');
  return { rawKey, hashedKey };
}

async function runSetup() {
  console.log('--- Setting up EfesusStone Integration ---');
  
  // 1. Create Tenant
  const tenantId = 'tenant_efesusstone_' + Date.now();
  const tenant = await prisma.tenant.create({
    data: {
      id: tenantId,
      name: 'EfesusStone CMS',
      slug: 'efesusstone-' + Date.now(),
      plan: 'free'
    }
  });
  
  // 2. Create Site
  const siteId = 'site_efesusstone_' + Date.now();
  const site = await prisma.site.create({
    data: {
      id: siteId,
      tenantId: tenant.id,
      name: 'EfesusStone',
      domain: 'efesusstone.com',
      platform: 'nextjs',
      defaultLocale: 'tr-TR'
    }
  });

  // 3. Create API Key
  const { rawKey, hashedKey } = generateApiKey('sk_test_');
  await prisma.apiKey.create({
    data: {
      tenantId: tenant.id,
      name: 'EfesusStone Development Key',
      keyPrefix: rawKey.substring(0, 12),
      keyHash: hashedKey,
      scopes: ['score:read', 'score:write', 'site:read', 'site:write', 'quota:read', 'semantic:read', 'ai:read', 'links:read', 'nw:read']
    }
  });
  
  console.log('\n--- SETUP COMPLETE ---');
  console.log('Tenant ID:', tenant.id);
  console.log('Site ID:  ', site.id);
  console.log('API Key:  ', rawKey);
  console.log('----------------------\n');
}

runSetup().catch(console.error).finally(() => prisma.$disconnect());
