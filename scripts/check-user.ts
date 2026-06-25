import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const p = new PrismaClient();

async function main() {
  for (const email of ['seo@gmedya.com', 'admin@gmedya.com']) {
    const u = await p.user.findUnique({
      where: { email },
      select: { id: true, email: true, role: true, tenantId: true, passwordHash: true },
    });
    console.log('\n---', email, '---');
    if (!u) {
      console.log('NOT FOUND');
      continue;
    }
    console.log('role:', u.role, 'tenantId:', u.tenantId);
    console.log('has passwordHash:', !!u.passwordHash);
    if (u.passwordHash) {
      console.log('GSeoSuite2026! match:', await bcrypt.compare('GSeoSuite2026!', u.passwordHash));
    }
  }
}

main().finally(() => p.$disconnect());
