import assert from 'node:assert/strict';
import test from 'node:test';
import {
  createPasswordHash,
  generateSecureToken,
  hashCapabilityToken,
  timingSafeStringEqual,
  verifyCapabilityToken,
  verifyPassword,
} from '../src/lib/crypto.ts';

test('capability tokens are random and are stored only as digests', async () => {
  const firstToken = generateSecureToken();
  const secondToken = generateSecureToken();
  assert.notEqual(firstToken, secondToken);
  assert.ok(firstToken.length >= 40);

  const digest = await hashCapabilityToken(firstToken);
  assert.match(digest, /^sha256:[a-f0-9]{64}$/);
  assert.equal(digest.includes(firstToken), false);
  assert.equal(await verifyCapabilityToken(firstToken, digest), true);
  assert.equal(await verifyCapabilityToken(secondToken, digest), false);
});

test('legacy raw capability values remain verifiable during migration', async () => {
  assert.equal(await verifyCapabilityToken('legacy-secret', 'legacy-secret'), true);
  assert.equal(await verifyCapabilityToken('wrong-secret', 'legacy-secret'), false);
});

test('new PIN hashes use salted PBKDF2 and reject incorrect values', async () => {
  const firstHash = await createPasswordHash('4821');
  const secondHash = await createPasswordHash('4821');
  assert.match(firstHash, /^pbkdf2-sha256\$310000\$/);
  assert.notEqual(firstHash, secondHash);
  assert.equal(await verifyPassword('4821', firstHash), true);
  assert.equal(await verifyPassword('0000', firstHash), false);
});

test('constant-time string comparison handles equal and unequal lengths', () => {
  assert.equal(timingSafeStringEqual('same-value', 'same-value'), true);
  assert.equal(timingSafeStringEqual('same-value', 'different'), false);
  assert.equal(timingSafeStringEqual('short', 'shorter'), false);
});
