import Analysis from '../models/Analysis.js';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import { analyzeText } from '../utils/gemini.js';
import { assertOwned } from '../utils/ownership.js';
import { config } from '../config.js';

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
    let extractedText = '';

    if (mimetype === 'application/pdf') {
        const pdfData = await pdfParse(fileBuffer);
        extractedText = pdfData.text;
    } else if (mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        const result = await mammoth.extractRawText({ buffer: fileBuffer });
        extractedText = result.value;
    } else if (mimetype === 'text/plain') {
        extractedText = fileBuffer.toString('utf-8');
    } else {
        throw new Error('UNSUPPORTED_FORMAT');
    }

    if (!extractedText || extractedText.trim().length === 0) {
        throw new Error('EMPTY_FILE');
    }

    if (extractedText.length > 50000) {
        extractedText = extractedText.substring(0, 50000);
    }

    // AI Analysis with timeout
    let timeout;
    const timeoutPromise = new Promise((_, reject) => {
        timeout = setTimeout(() => reject(new Error('TIMEOUT')), config.geminiTimeoutMs);
    });
    
    let aiSummary;
    try {
        aiSummary = await Promise.race([
            analyzeText(extractedText),
            timeoutPromise
        ]);
    } catch (err) {
        if (err.message === 'TIMEOUT') throw new Error('AI_TIMEOUT');
        if (err.message === 'AI_TIMEOUT' || err.message === 'AI_INPUT_TOO_LARGE') throw err;
        throw new Error(`AI_ERROR:${err.message}`);
    } finally {
        clearTimeout(timeout);
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
