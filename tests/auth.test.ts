import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import test from 'node:test';
import { createSession, verifySessionToken } from '../lib/auth';

process.env.AUTH_SECRET = 'unit-test-secret-value-with-at-least-32-characters';

function tokenFor(claims: Record<string, unknown>, alg = 'HS256') {
  const encode = (value: unknown) => Buffer.from(JSON.stringify(value)).toString('base64url');
  const input = `${encode({ alg, typ: 'JWT' })}.${encode(claims)}`;
  const signature = createHmac('sha256', process.env.AUTH_SECRET!).update(input).digest('base64url');
  return `${input}.${signature}`;
}

test('creates and verifies a signed admin session', async () => {
  const token = await createSession('admin-123');
  assert.equal(verifySessionToken(token)?.sub, 'admin-123');
  assert.equal(verifySessionToken(token)?.role, 'admin');
});

test('rejects tampered, expired, malformed, and non-admin session tokens', () => {
  const valid = tokenFor({ sub: 'admin-123', role: 'admin', iat: 1, exp: Math.floor(Date.now() / 1000) + 60 });
  assert.equal(verifySessionToken(`${valid.slice(0, -1)}x`), null);
  assert.equal(verifySessionToken(tokenFor({ sub: 'admin-123', role: 'admin', iat: 1, exp: 1 })), null);
  assert.equal(verifySessionToken(tokenFor({ sub: 'user-123', role: 'user', iat: 1, exp: Math.floor(Date.now() / 1000) + 60 })), null);
  assert.equal(verifySessionToken(tokenFor({ sub: 'admin-123', role: 'admin', iat: 1, exp: Math.floor(Date.now() / 1000) + 60 }, 'none')), null);
  assert.equal(verifySessionToken('not-a-token'), null);
  assert.equal(verifySessionToken(undefined), null);
});
