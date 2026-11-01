import test from 'node:test';
import assert from 'node:assert/strict';
import { generateText } from './groq.js';

process.env.GROQ_API_KEY ||= 'test-groq-key';

const response = (status, payload, headers = {}) => ({
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 200 ? 'OK' : 'Provider error',
    headers: { get: (name) => headers[name.toLowerCase()] ?? null },
    json: async () => payload
});

const success = (content = 'Relatório completo.', finishReason = 'stop') => response(200, {
    choices: [{ finish_reason: finishReason, message: { content } }]
});
const syntheticMessages = [{ role: 'user', content: 'Reunião sintética' }];

test('generateText returns a successful completion', async (t) => {
    const fetchMock = t.mock.method(globalThis, 'fetch', async () => success());
    const result = await generateText(syntheticMessages, 'test_groq_success');

    assert.equal(result, 'Relatório completo.');
    assert.equal(fetchMock.mock.callCount(), 1);
    const request = JSON.parse(fetchMock.mock.calls[0].arguments[1].body);
    assert.equal(request.model, 'openai/gpt-oss-120b');
    assert.equal(request.messages[0].role, 'user');
    assert.equal(request.reasoning_effort, 'medium');
    assert.equal(request.include_reasoning, false);
    assert.equal(request.stream, false);
});

test('generateText rejects an empty response', async (t) => {
    t.mock.method(console, 'error', () => {});
    t.mock.method(globalThis, 'fetch', async () => success(''));
    await assert.rejects(generateText(syntheticMessages), { message: 'AI_EMPTY_RESPONSE' });
});

test('generateText rejects a response truncated by the completion limit', async (t) => {
    t.mock.method(console, 'error', () => {});
    t.mock.method(globalThis, 'fetch', async () => success('Relatório parcial', 'length'));
    await assert.rejects(generateText(syntheticMessages), { message: 'AI_OUTPUT_TRUNCATED' });
});

test('generateText retries a 429 using Retry-After before returning the completion', async (t) => {
    t.mock.method(console, 'warn', () => {});
    let attempts = 0;
    const fetchMock = t.mock.method(globalThis, 'fetch', async () => {
        attempts += 1;
        return attempts === 1
            ? response(429, { error: { message: 'Rate limited' } }, { 'retry-after': '0' })
            : success();
    });

    assert.equal(await generateText(syntheticMessages), 'Relatório completo.');
    assert.equal(fetchMock.mock.callCount(), 2);
});

test('generateText retries one 5xx response and reports provider unavailability', async (t) => {
    t.mock.method(console, 'error', () => {});
    t.mock.method(console, 'warn', () => {});
    const fetchMock = t.mock.method(globalThis, 'fetch', async () => response(503, { error: { message: 'Busy' } }));

    await assert.rejects(generateText(syntheticMessages), { message: 'AI_PROVIDER_UNAVAILABLE' });
    assert.equal(fetchMock.mock.callCount(), 2);
});

test('generateText aborts at the shared deadline and records the timeout', async (t) => {
    t.mock.method(console, 'error', () => {});
    t.mock.method(globalThis, 'fetch', async (_url, { signal }) => new Promise((_resolve, reject) => {
        signal.addEventListener('abort', () => {
            const error = new Error('Request aborted');
            error.name = 'AbortError';
            reject(error);
        }, { once: true });
    }));

    await assert.rejects(generateText(syntheticMessages, 'test_groq_timeout', { timeoutMs: 5 }), { message: 'AI_TIMEOUT' });
});
