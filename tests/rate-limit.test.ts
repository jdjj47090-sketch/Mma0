import assert from 'node:assert/strict';
import test from 'node:test';
import { rateLimit } from '../lib/rate-limit';

test('allows requests up to the configured limit, then denies excess requests', () => {
  const key = `unit-${crypto.randomUUID()}`;
  assert.equal(rateLimit(key, 2), true);
  assert.equal(rateLimit(key, 2), true);
  assert.equal(rateLimit(key, 2), false);
});

test('tracks separate clients independently', () => {
  const suffix = crypto.randomUUID();
  assert.equal(rateLimit(`client-a-${suffix}`, 1), true);
  assert.equal(rateLimit(`client-a-${suffix}`, 1), false);
  assert.equal(rateLimit(`client-b-${suffix}`, 1), true);
});
