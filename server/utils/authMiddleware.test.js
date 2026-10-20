import test from 'node:test';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';
import authMiddleware from './authMiddleware.js';

const secret = 'unit-test-secret-that-is-not-used-in-production';
process.env.JWT_SECRET = secret;

const invoke = (authorization) => {
    const req = { header: () => authorization };
    let statusCode;
    let payload;
    let nextCalled = false;
    const res = {
        status(code) { statusCode = code; return this; },
        json(body) { payload = body; return this; }
    };
    authMiddleware(req, res, () => { nextCalled = true; });
    return { req, statusCode, payload, nextCalled };
};

test('rejects a request without a bearer token', () => {
    const result = invoke(undefined);
    assert.equal(result.statusCode, 401);
    assert.equal(result.nextCalled, false);
});

test('accepts a valid token and attaches its user payload', () => {
    const token = jwt.sign({ user: { id: 'user-1' } }, secret, { expiresIn: '1m' });
    const result = invoke(`Bearer ${token}`);
    assert.equal(result.nextCalled, true);
    assert.equal(result.req.user.id, 'user-1');
});

test('rejects an expired token', () => {
    const token = jwt.sign({ user: { id: 'user-1' } }, secret, { expiresIn: -1 });
    const result = invoke(`Bearer ${token}`);
    assert.equal(result.statusCode, 401);
    assert.match(result.payload.msg, /expirado/i);
});
