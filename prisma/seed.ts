import { PrismaClient } from '@prisma/client';
import { generateApiKeyString, hashApiKey } from '../src/lib/auth/keys';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 1. Create or get default GMedya Tenant
  const tenant = await prisma.tenant.upsert({
    where: { slug: 'gmedya' },
    update: {
      aiCreditLimit: 500,
      aiCreditUsed: 45,
      supportNotes: 'GMedya internal dogfooding and testing tenant.',
    },
    create: {
      name: 'GMedya Dogfooding',
      slug: 'gmedya',
      plan: 'agency',
      aiCreditLimit: 500,
      aiCreditUsed: 45,
      supportNotes: 'GMedya internal dogfooding and testing tenant.',
    },
  });
  console.log(`Tenant verified: ${tenant.name} (${tenant.id})`);

  // 2. Create or get default admin user
  const user = await prisma.user.upsert({
    where: { email: 'seo@gmedya.com' },
    update: {},
    create: {
      tenantId: tenant.id,
      email: 'seo@gmedya.com',
      name: 'GMedya SEO Admin',
      role: 'admin',
    },
  });
  console.log(`User verified: ${user.email}`);

  // 3. Check if we already have an active API Key
  const existingKey = await prisma.apiKey.findFirst({
    where: {
      tenantId: tenant.id,
      revokedAt: null,
    },
  });

  if (existingKey) {
    console.log(`Active API key with prefix '${existingKey.keyPrefix}' already exists.`);
    console.log('Skipping API key creation to avoid duplicates.');
  } else {
    // Generate new API key
    const rawKey = generateApiKeyString('live');
    const keyHash = hashApiKey(rawKey);
    const keyPrefix = rawKey.slice(0, 14);

    await prisma.apiKey.create({
      data: {
        tenantId: tenant.id,
        name: 'GMedya Default Key',
        keyHash,
        keyPrefix,
        scopes: [
          'score:read',
          'site:read',
          'site:write',
          'semantic:read',
          'links:read',
          'ai:read',
          'quota:read',
          'webhook:write',
        ],
      },
    });

    console.log('\n============================================================');
    console.log('SeoSuite Database Seeded Successfully!');
    console.log(`Tenant: ${tenant.name}`);
    console.log(`Created Default API Key: ${rawKey}`);
    console.log('IMPORTANT: Save this key. It will not be shown again.');
    console.log('============================================================\n');
  }
}

main()
  .catch((e) => {
    console.error('Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
