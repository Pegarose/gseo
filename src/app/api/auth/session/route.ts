import { auth } from '@/auth';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  const session = await auth();
  return NextResponse.json({ session });
}

export async function PATCH(req: NextRequest) {
  const session = await auth();

  if (session?.user.role !== 'super_admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const { impersonatedTenantId } = body;

  if (!impersonatedTenantId || typeof impersonatedTenantId !== 'string') {
    return NextResponse.json({ error: 'Missing impersonatedTenantId' }, { status: 400 });
  }

  // Only allow impersonation token update; real session mutation is handled client-side via session update callback
  return NextResponse.json({ impersonatedTenantId });
}
