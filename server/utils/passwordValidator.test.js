import test from 'node:test';
import assert from 'node:assert/strict';
import { validatePasswordStrength } from './passwordValidator.js';

test('accepts a password meeting all required rules', () => {
    assert.equal(validatePasswordStrength('StrongPass123!').isValid, true);
});

test('rejects short passwords and reports the minimum length', () => {
    const result = validatePasswordStrength('Sh0rt!');
    assert.equal(result.isValid, false);
    assert.ok(result.errors.some(error => error.includes('12 caracteres')));
});

test('rejects passwords without punctuation', () => {
    const result = validatePasswordStrength('StrongPassword123');
    assert.equal(result.isValid, false);
    assert.ok(result.errors.some(error => error.includes('caractere especial')));
});
