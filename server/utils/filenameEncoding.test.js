import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeFilenameEncoding } from './filenameEncoding.js';

test('normalizes mojibake in Portuguese upload filenames', () => {
    assert.equal(normalizeFilenameEncoding('TranscriÃ§Ã£o Daily Standup.pdf'), 'Transcrição Daily Standup.pdf');
});

test('keeps correctly encoded filenames unchanged', () => {
    assert.equal(normalizeFilenameEncoding('Transcrição Daily Standup.pdf'), 'Transcrição Daily Standup.pdf');
});
