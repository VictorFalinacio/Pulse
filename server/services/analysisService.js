import Analysis from '../models/Analysis.js';
import { analyzeText } from '../utils/groq.js';
import { assertOwned } from '../utils/ownership.js';
import { config } from '../config.js';
import { extractText } from '../utils/textExtraction.js';

export const checkCooldown = async (userId) => {
    const lastAnalysis = await Analysis.findOne({ userId }).sort({ createdAt: -1 });
    if (!lastAnalysis) return { onCooldown: false, remaining: 0 };

    const timeSinceLastAnalysis = Date.now() - new Date(lastAnalysis.createdAt).getTime();
    if (timeSinceLastAnalysis < 60 * 1000) {
        return { onCooldown: true, remaining: 60 - Math.floor(timeSinceLastAnalysis / 1000) };
    }
    return { onCooldown: false, remaining: 0 };
};

export const processAnalysis = async (userId, fileBuffer, mimetype, originalname) => {
    let extractedText = await extractText(fileBuffer, mimetype);

    if (!extractedText || extractedText.trim().length === 0) {
        throw new Error('EMPTY_FILE');
    }

    extractedText = extractedText.slice(0, config.aiMaxInputChars);

    let aiSummary;
    try {
        aiSummary = await analyzeText(extractedText);
    } catch (err) {
        if (['AI_TIMEOUT', 'AI_INPUT_TOO_LARGE', 'AI_OUTPUT_TRUNCATED', 'AI_RATE_LIMITED',
            'AI_PROVIDER_UNAVAILABLE', 'AI_PROVIDER_ERROR', 'AI_EMPTY_RESPONSE', 'GROQ_NOT_CONFIGURED'].includes(err.message)) throw err;
        throw new Error(`AI_ERROR:${err.message}`);
    }

    const newAnalysis = new Analysis({
        userId,
        fileName: originalname,
        fileType: mimetype,
        originalText: extractedText,
        summary: aiSummary
    });

    return await newAnalysis.save();
};

export const getHistory = async (userId) => {
    return await Analysis.find({ userId, sprintId: { $exists: false } }).sort({ createdAt: -1 });
};

export const deleteAnalysis = async (analysisId, userId) => {
    const analysis = await Analysis.findById(analysisId);
    assertOwned(analysis, userId);

    await Analysis.findByIdAndDelete(analysisId);
};
