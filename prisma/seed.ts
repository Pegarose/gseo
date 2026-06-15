import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Upsert the main dogfooding tenant
  const tenant = await prisma.tenant.upsert({
    where: { slug: 'gmedya' },
    update: {},
    create: {
      name: 'GMedya Dogfooding',
      slug: 'gmedya',
      plan: 'agency',
      aiCreditLimit: 500,
      aiCreditUsed: 45,
      supportNotes: 'GMedya internal dogfooding and testing tenant.',
    },
  });

  // Upsert a default super admin user
  const adminPassword = await bcrypt.hash('GSeoSuite2026!', 10);
  await prisma.user.upsert({
    where: { email: 'admin@gmedya.com' },
    update: {},
    create: {
      email: 'admin@gmedya.com',
      name: 'Super Admin',
      role: 'super_admin',
      passwordHash: adminPassword,
    },
  });

  // Upsert a default tenant user
  const editorPassword = await bcrypt.hash('GSeoSuite2026!', 10);
  await prisma.user.upsert({
    where: { email: 'seo@gmedya.com' },
    update: {},
    create: {
      email: 'seo@gmedya.com',
      name: 'SEO Editor',
      role: 'editor',
      tenantId: tenant.id,
      passwordHash: editorPassword,
    },
  });

  console.log(`Tenant verified: ${tenant.name} (${tenant.id})`);
  console.log('User verified: seo@gmedya.com');

  // Upsert a default API key for dogfooding
  const existingKey = await prisma.apiKey.findFirst({
    where: { tenantId: tenant.id, revokedAt: null },
  });

  if (!existingKey) {
    const crypto = await import('crypto');
    const rawKey = 'gseo_live_269c' + crypto.randomBytes(16).toString('hex');
    const hashed = crypto.createHash('sha256').update(rawKey).digest('hex');

    await prisma.apiKey.create({
      data: {
        tenantId: tenant.id,
        name: 'Dogfood Key',
        keyPrefix: rawKey.substring(0, 12),
        keyHash: hashed,
        scopes: ['score:read', 'site:read', 'site:write', 'quota:read', 'semantic:read', 'ai:read', 'links:read', 'webhook:write'],
      },
    });
    console.log(`Created API key: ${rawKey.substring(0, 16)}...`);
  } else {
    console.log(`Active API key with prefix '${existingKey.keyPrefix}' already exists.`);
    console.log('Skipping API key creation to avoid duplicates.');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
