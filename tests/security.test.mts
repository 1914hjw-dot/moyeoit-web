import assert from 'node:assert/strict';
import test from 'node:test';
import {
  createPasswordHash,
  generateSecureToken,
  hashCapabilityToken,
  hashPassword,
  timingSafeStringEqual,
  verifyCapabilityToken,
  verifyPassword,
  verifyVoteOwnership,
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

test('PIN-protected votes require a valid 4-digit PIN even when vote_token matches', async () => {
  const passwordHash = await createPasswordHash('4821');
  const storedToken = 'cached-device-token';

  assert.deepEqual(
    await verifyVoteOwnership({
      password: '',
      storedPasswordHash: passwordHash,
      voteToken: storedToken,
      storedVoteToken: storedToken,
    }),
    { authorized: false, method: 'none', reason: 'INVALID_PIN' }
  );

  assert.deepEqual(
    await verifyVoteOwnership({
      password: '????',
      storedPasswordHash: passwordHash,
      voteToken: storedToken,
      storedVoteToken: storedToken,
    }),
    { authorized: false, method: 'none', reason: 'INVALID_PIN' }
  );

  assert.deepEqual(
    await verifyVoteOwnership({
      password: '0000',
      storedPasswordHash: passwordHash,
      voteToken: storedToken,
      storedVoteToken: storedToken,
    }),
    { authorized: false, method: 'none', reason: 'INVALID_PIN' }
  );

  assert.deepEqual(
    await verifyVoteOwnership({
      password: '4821',
      storedPasswordHash: passwordHash,
      voteToken: '',
      storedVoteToken: storedToken,
    }),
    { authorized: true, method: 'pin' }
  );
});

test('legacy votes without PIN allow matching vote_token only when no invalid password is given', async () => {
  const storedToken = 'legacy-device-token';

  assert.deepEqual(
    await verifyVoteOwnership({
      password: '????',
      storedPasswordHash: '',
      voteToken: storedToken,
      storedVoteToken: storedToken,
    }),
    { authorized: false, method: 'none', reason: 'INVALID_PIN' }
  );

  assert.deepEqual(
    await verifyVoteOwnership({
      password: '',
      storedPasswordHash: '',
      voteToken: 'wrong-token',
      storedVoteToken: storedToken,
    }),
    { authorized: false, method: 'none', reason: 'MISSING_OWNERSHIP' }
  );

  assert.deepEqual(
    await verifyVoteOwnership({
      password: '',
      storedPasswordHash: '',
      voteToken: storedToken,
      storedVoteToken: storedToken,
    }),
    { authorized: true, method: 'legacy_token' }
  );

  assert.deepEqual(
    await verifyVoteOwnership({
      password: '1234',
      storedPasswordHash: '',
      voteToken: storedToken,
      storedVoteToken: storedToken,
      allowLegacyPinUpgrade: true,
    }),
    { authorized: true, method: 'legacy_token' }
  );
});

test('legacy SHA-256 PIN hashes in existing DB still verify without vote_token and reject wrong PINs', async () => {
  const legacyHash = await hashPassword('7391');
  const storedToken = 'cached-device-token';

  assert.deepEqual(
    await verifyVoteOwnership({
      password: '',
      storedPasswordHash: legacyHash,
      voteToken: storedToken,
      storedVoteToken: storedToken,
    }),
    { authorized: false, method: 'none', reason: 'INVALID_PIN' }
  );

  assert.deepEqual(
    await verifyVoteOwnership({
      password: '7391',
      storedPasswordHash: legacyHash,
      voteToken: '',
      storedVoteToken: storedToken,
    }),
    { authorized: true, method: 'pin' }
  );
});
