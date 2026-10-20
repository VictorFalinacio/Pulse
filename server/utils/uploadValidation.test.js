import test from 'node:test';
import assert from 'node:assert/strict';
import { validateFileMagicBytes } from './uploadValidation.js';

test('recognizes a PDF by its signature', () => {
    assert.equal(validateFileMagicBytes(Buffer.from('%PDF-1.7'), 'application/pdf'), true);
    assert.equal(validateFileMagicBytes(Buffer.from('not a PDF'), 'application/pdf'), false);
});

test('recognizes a DOCX container by its ZIP signature', () => {
    assert.equal(
        validateFileMagicBytes(Buffer.from([0x50, 0x4b, 0x03, 0x04, 0x00]), 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'),
        true
    );
    assert.equal(
        validateFileMagicBytes(Buffer.from('text'), 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'),
        false
    );
});

test('rejects unsupported MIME types', () => {
    assert.equal(validateFileMagicBytes(Buffer.from('content'), 'application/octet-stream'), false);
});
