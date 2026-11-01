import { log } from './logger.js';
import { config } from '../config.js';
import { createAnalysisMessages, createSprintMessages } from '../prompts/analysisPrompts.js';

const validateInput = (text) => {
    if (typeof text !== 'string' || !text.trim()) throw new Error('EMPTY_AI_INPUT');
    if (text.length > config.aiMaxInputChars) throw new Error('AI_INPUT_TOO_LARGE');
};

export const generateText = async (messages, eventName = 'groq_analysis_failed', options = {}) => {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) throw new Error('GROQ_NOT_CONFIGURED');
    const timeoutMs = options.timeoutMs ?? config.aiTimeoutMs;
    const fetchImpl = options.fetchImpl ?? globalThis.fetch;
    const deadline = Date.now() + timeoutMs;
    const maxAttempts = 2;

    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
        const remainingMs = deadline - Date.now();
        if (remainingMs <= 0) {
            log('error', 'groq_timeout', { attempt, model: config.groqModel });
            throw new Error('AI_TIMEOUT');
        }

        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), remainingMs);
        let response;
        let data;

        try {
            response = await fetchImpl('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: config.groqModel,
                    messages,
                    max_completion_tokens: config.aiMaxOutputTokens,
                    reasoning_effort: config.aiReasoningEffort,
                    include_reasoning: false,
                    stream: false
                }),
                signal: controller.signal
            });
            data = await response.json().catch(() => ({}));
        } catch (error) {
            clearTimeout(timer);
            if (error.name === 'AbortError') {
                log('error', 'groq_timeout', { attempt, model: config.groqModel });
                throw new Error('AI_TIMEOUT');
            }
            log('error', eventName, { message: error.message, model: config.groqModel });
            throw new Error('AI_PROVIDER_UNAVAILABLE');
        }

        clearTimeout(timer);
        if (response.status === 429 || response.status >= 500) {
            const providerMessage = data?.error?.message || response.statusText;
            const errorCode = response.status === 429 ? 'AI_RATE_LIMITED' : 'AI_PROVIDER_UNAVAILABLE';

            if (attempt < maxAttempts) {
                const retryAfterHeader = response.headers.get('retry-after');
                const retryAfterSeconds = retryAfterHeader === null ? null : Number(retryAfterHeader);
                const retryAfterDate = retryAfterHeader && Number.isNaN(retryAfterSeconds)
                    ? Date.parse(retryAfterHeader)
                    : NaN;
                const retryAfterMs = retryAfterHeader === null ? null
                    : Number.isFinite(retryAfterSeconds) ? Math.max(0, retryAfterSeconds * 1000)
                        : Number.isFinite(retryAfterDate) ? Math.max(0, retryAfterDate - Date.now()) : null;
                const backoffMs = 250 * (2 ** (attempt - 1)) + Math.floor(Math.random() * 250);
                const delayMs = retryAfterMs ?? backoffMs;
                const remaining = deadline - Date.now();

                if (delayMs < remaining) {
                    log('warn', 'groq_retry', { attempt, status: response.status, delayMs, model: config.groqModel });
                    await new Promise(resolve => setTimeout(resolve, delayMs));
                    continue;
                }
            }

            log('error', eventName, { status: response.status, message: providerMessage, model: config.groqModel });
            throw new Error(errorCode);
        }

        if (!response.ok) {
            log('error', eventName, {
                status: response.status,
                message: data?.error?.message || response.statusText,
                model: config.groqModel
            });
            throw new Error('AI_PROVIDER_ERROR');
        }

        const choice = data?.choices?.[0];
        if (choice?.finish_reason === 'length') {
            log('error', 'groq_response_truncated', { model: config.groqModel });
            throw new Error('AI_OUTPUT_TRUNCATED');
        }
        const content = choice?.message?.content;
        if (typeof content !== 'string' || !content.trim()) {
            log('error', eventName, { message: 'Groq returned an empty response.', model: config.groqModel });
            throw new Error('AI_EMPTY_RESPONSE');
        }
        return content;
    }

    throw new Error('AI_PROVIDER_UNAVAILABLE');
};

export const analyzeText = async (text) => {
    validateInput(text);
    return generateText(createAnalysisMessages(text), 'groq_analysis_failed');
};

export const analyzeSprintContext = async (allTexts) => {
    const combinedText = allTexts.join('\n\n--- NOVA REUNIÃO ---\n\n');
    validateInput(combinedText);
    const daySections = combinedText.match(/\bDia\s+\d+\s*:/gi) || [];
    const meetingCount = new Set(daySections.map(section => section.match(/\d+/)?.[0])).size || allTexts.length;
    return generateText(createSprintMessages(combinedText, meetingCount), 'groq_sprint_analysis_failed');
};
