const positiveInteger = (name, fallback, maximum) => {
    const parsed = Number(process.env[name]);
    if (!Number.isSafeInteger(parsed) || parsed < 1) return fallback;
    return Math.min(parsed, maximum);
};

export const config = Object.freeze({
    geminiModel: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
    geminiMaxInputChars: positiveInteger('GEMINI_MAX_INPUT_CHARS', 50000, 100000),
    geminiMaxSprintContextChars: positiveInteger('GEMINI_MAX_SPRINT_CONTEXT_CHARS', 50000, 100000),
    geminiMaxOutputTokens: positiveInteger('GEMINI_MAX_OUTPUT_TOKENS', 4096, 8192),
    geminiTimeoutMs: positiveInteger('GEMINI_TIMEOUT_MS', 25000, 28000)
});
