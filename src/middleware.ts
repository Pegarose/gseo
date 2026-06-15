import { auth } from '@/auth';
import { NextResponse } from 'next/server';

export default auth((req) => {
  const { nextUrl, auth: session } = req;

  const isSuperAdminPath = nextUrl.pathname.startsWith('/super-admin');
  const isDashboardPath = nextUrl.pathname.startsWith('/dashboard');

  // Read impersonation cookie for read-only tenant preview
  const impersonatedTenantId = req.cookies.get('impersonated_tenant_id')?.value;

  if (session?.user && impersonatedTenantId && session.user.role === 'super_admin') {
    session.user.impersonatedTenantId = impersonatedTenantId;
  }

  // Public paths
  if (nextUrl.pathname === '/login' || nextUrl.pathname === '/api/auth/signin') {
    if (session) {
      return NextResponse.redirect(new URL('/dashboard', nextUrl));
    }
    return NextResponse.next();
  }

  if (isSuperAdminPath || isDashboardPath) {
    if (!session?.user) {
      return NextResponse.redirect(new URL('/login', nextUrl));
    }

    if (isSuperAdminPath && session.user.role !== 'super_admin') {
      return NextResponse.redirect(new URL('/dashboard', nextUrl));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/dashboard/:path*', '/super-admin/:path*', '/login'],
};
