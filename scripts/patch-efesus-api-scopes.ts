import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const EXTRA_SCOPES = [
  'semantic:read',
  'ai:read',
  'links:read',
  'nw:read',
] as const;

async function main() {
  const keyId = process.env.API_KEY_ID ?? '23be940d-2cc8-4983-9065-e0402513fad4';
  const key = await prisma.apiKey.findUnique({ where: { id: keyId } });
  if (!key) {
    console.error('API key not found:', keyId);
    process.exit(1);
  }

  const merged = Array.from(new Set([...key.scopes, ...EXTRA_SCOPES]));
  await prisma.apiKey.update({
    where: { id: key.id },
    data: { scopes: merged },
  });
  console.log('Updated', key.name, '→', merged.join(', '));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
