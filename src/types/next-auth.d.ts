import { DefaultSession, DefaultUser } from 'next-auth';

declare module 'next-auth' {
  interface User extends DefaultUser {
    role?: string;
    tenantId?: string;
    impersonatedTenantId?: string;
  }

  interface Session extends DefaultSession {
    user: {
      id: string;
      role?: string;
      tenantId?: string;
      impersonatedTenantId?: string;
    } & DefaultSession['user'];
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string;
    role?: string;
    tenantId?: string;
    impersonatedTenantId?: string;
  }
}
