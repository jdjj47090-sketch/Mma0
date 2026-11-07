import assert from 'node:assert/strict';
import test from 'node:test';
import { generateStrongPassword } from '../scripts/create-admin';

test('generated admin passwords meet the length and character requirements', () => {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    const password = generateStrongPassword();
    assert.ok(password.length >= 16);
    assert.match(password, /[A-Z]/);
    assert.match(password, /[a-z]/);
    assert.match(password, /[0-9]/);
    assert.match(password, /[^A-Za-z0-9]/);
  }
});
