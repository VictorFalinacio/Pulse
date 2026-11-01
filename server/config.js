const positiveInteger = (name, fallback, maximum) => {
    const parsed = Number(process.env[name]);
    if (!Number.isSafeInteger(parsed) || parsed < 1) return fallback;
    return Math.min(parsed, maximum);
};

export const config = Object.freeze({
    groqModel: process.env.GROQ_MODEL || 'openai/gpt-oss-120b',
    aiMaxInputChars: positiveInteger('AI_MAX_INPUT_CHARS', positiveInteger('GEMINI_MAX_INPUT_CHARS', 50000, 100000), 100000),
    aiMaxSprintContextChars: positiveInteger('AI_MAX_SPRINT_CONTEXT_CHARS', positiveInteger('GEMINI_MAX_SPRINT_CONTEXT_CHARS', 50000, 100000), 100000),
    aiMaxOutputTokens: positiveInteger('AI_MAX_OUTPUT_TOKENS', positiveInteger('GEMINI_MAX_OUTPUT_TOKENS', 4096, 8192), 8192),
    aiTimeoutMs: positiveInteger('AI_TIMEOUT_MS', positiveInteger('GEMINI_TIMEOUT_MS', 25000, 28000), 28000)
});
