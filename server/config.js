const positiveInteger = (name, fallback, maximum) => {
    const parsed = Number(process.env[name]);
    if (!Number.isSafeInteger(parsed) || parsed < 1) return fallback;
    return Math.min(parsed, maximum);
};

const trustProxyHops = () => {
    const configured = process.env.TRUST_PROXY_HOPS;
    const value = configured === undefined ? (process.env.VERCEL ? 1 : 0) : Number(configured);
    if (!Number.isSafeInteger(value) || value < 0 || value > 5) {
        throw new Error('TRUST_PROXY_HOPS must be an integer between 0 and 5.');
    }
    return value;
};

const reasoningEffort = () => {
    const value = process.env.AI_REASONING_EFFORT || 'medium';
    if (!['low', 'medium', 'high'].includes(value)) {
        throw new Error('AI_REASONING_EFFORT must be low, medium, or high.');
    }
    return value;
};

export const config = Object.freeze({
    groqModel: process.env.GROQ_MODEL || 'openai/gpt-oss-120b',
    aiMaxInputChars: positiveInteger('AI_MAX_INPUT_CHARS', positiveInteger('GEMINI_MAX_INPUT_CHARS', 50000, 100000), 100000),
    aiMaxSprintContextChars: positiveInteger('AI_MAX_SPRINT_CONTEXT_CHARS', positiveInteger('GEMINI_MAX_SPRINT_CONTEXT_CHARS', 50000, 100000), 100000),
    aiMaxOutputTokens: positiveInteger('AI_MAX_OUTPUT_TOKENS', positiveInteger('GEMINI_MAX_OUTPUT_TOKENS', 8192, 8192), 8192),
    aiTimeoutMs: positiveInteger('AI_TIMEOUT_MS', positiveInteger('GEMINI_TIMEOUT_MS', 22000, 25000), 25000),
    aiReasoningEffort: reasoningEffort(),
    trustProxyHops: trustProxyHops()
});
