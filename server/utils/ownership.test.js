import test from 'node:test';
import assert from 'node:assert/strict';
import { assertOwned } from './ownership.js';

test('allows access when the resource belongs to the authenticated user', () => {
    assert.doesNotThrow(() => assertOwned({ userId: { toString: () => 'user-1' } }, 'user-1'));
});

test('returns not found for a missing resource', () => {
    assert.throws(() => assertOwned(null, 'user-1'), { message: 'NOT_FOUND' });
});

test('rejects access when another user owns the resource', () => {
    assert.throws(
        () => assertOwned({ userId: { toString: () => 'user-2' } }, 'user-1'),
        { message: 'UNAUTHORIZED' }
    );
});
