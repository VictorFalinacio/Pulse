import test from 'node:test';
import assert from 'node:assert/strict';
import { extractText } from './textExtraction.js';

test('extractText decodes UTF-8 plain text', async () => {
    const text = 'Reunião sintética: definição de próxima ação.';
    assert.equal(await extractText(Buffer.from(text, 'utf8'), 'text/plain'), text);
});

test('extractText rejects unsupported formats with a shared error', async () => {
    await assert.rejects(extractText(Buffer.from('data'), 'application/octet-stream'), { message: 'UNSUPPORTED_FORMAT' });
});
