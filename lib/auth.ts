import { createHmac, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';

type Claims = { sub: string; role: 'admin'; iat: number; exp: number };

function key() {
  const value = process.env.AUTH_SECRET;
  if (!value || value.length < 32) {
    throw new Error('AUTH_SECRET must contain at least 32 characters');
  }
  return value;
}

function signature(input: string) {
  return createHmac('sha256', key()).update(input).digest('base64url');
}

export async function createSession(subject: string) {
  const now = Math.floor(Date.now() / 1000);
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(JSON.stringify({ sub: subject, role: 'admin', iat: now, exp: now + 8 * 60 * 60 })).toString('base64url');
  const input = `${header}.${payload}`;
  return `${input}.${signature(input)}`;
}

export function verifySessionToken(token: string | undefined): Claims | null {
  if (!token) return null;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const input = `${parts[0]}.${parts[1]}`;
    const expected = Buffer.from(signature(input));
    const actual = Buffer.from(parts[2]);
    if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return null;

    const header = JSON.parse(Buffer.from(parts[0], 'base64url').toString());
    if (header.alg !== 'HS256' || header.typ !== 'JWT') return null;

    const claims = JSON.parse(Buffer.from(parts[1], 'base64url').toString()) as Claims;
    if (claims.role !== 'admin' || typeof claims.sub !== 'string' || typeof claims.exp !== 'number' || claims.exp <= Date.now() / 1000) return null;
    return claims;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<Claims | null> {
  const token = (await cookies()).get('mahdi_session')?.value;
  return verifySessionToken(token);
}
