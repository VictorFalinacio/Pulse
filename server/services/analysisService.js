import Analysis from '../models/Analysis.js';
import mongoose from 'mongoose';
import { analyzeText } from '../utils/gemini.js';
import { assertOwned } from '../utils/ownership.js';
import { extractText } from '../utils/extractText.js';
import { normalizeFileName } from '../utils/fileName.js';

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
    const extractedText = await extractText(fileBuffer, mimetype);
    let aiSummary;
    try {
        aiSummary = await analyzeText(extractedText);
    } catch (err) {
        if (err.message === 'AI_TIMEOUT' || err.message === 'AI_INPUT_TOO_LARGE') throw err;
        throw new Error(`AI_ERROR:${err.message}`);
    }

    const newAnalysis = new Analysis({
        userId,
        fileName: normalizeFileName(originalname),
        fileType: mimetype,
        originalText: extractedText,
        summary: aiSummary
    });

    return await newAnalysis.save();
};

export const getHistory = async (userId) => {
    return await Analysis.find({ userId, sprintId: mongoose.trusted({ $exists: false }) }).sort({ createdAt: -1 });
};

export const deleteAnalysis = async (analysisId, userId) => {
    const analysis = await Analysis.findById(analysisId);
    assertOwned(analysis, userId);

    await Analysis.findByIdAndDelete(analysisId);
};
