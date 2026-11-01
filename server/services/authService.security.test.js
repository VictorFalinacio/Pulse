import test from 'node:test';
import assert from 'node:assert/strict';
import User from '../models/User.js';
import {
    registerUser,
    loginUser,
    verifyEmail,
    requestPasswordReset,
    verifyResetToken,
    resetPassword
} from './authService.js';

const maliciousValues = [
    { $ne: null },
    { $gt: '' },
    ['token'],
    42
];

test('auth rejects non-string values before any database query', async (t) => {
    const findOne = t.mock.method(User, 'findOne', async () => null);

    for (const value of maliciousValues) {
        await assert.rejects(registerUser('Example User', value, 'StrongPassword123!'), { message: 'EMAIL_INVALID' });
        await assert.rejects(loginUser(value, 'StrongPassword123!'), { message: 'EMAIL_INVALID' });
        await assert.rejects(requestPasswordReset(value), { message: 'EMAIL_INVALID' });
        await assert.rejects(verifyEmail(value), { message: 'TOKEN_INVALID' });
        await assert.rejects(verifyResetToken(value), { message: 'TOKEN_INVALID' });
        await assert.rejects(resetPassword(value, 'StrongPassword123!'), { message: 'TOKEN_INVALID' });
        await assert.rejects(resetPassword('token', value), { message: 'PASSWORD_INVALID' });
        await assert.rejects(registerUser(value, 'person@example.com', 'StrongPassword123!'), { message: 'NAME_INVALID' });
        await assert.rejects(registerUser('Example User', 'person@example.com', value), { message: 'PASSWORD_INVALID' });
        await assert.rejects(loginUser('person@example.com', value), { message: 'PASSWORD_INVALID' });
    }

    assert.equal(findOne.mock.callCount(), 0);
});
