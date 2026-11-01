import Sprint from '../models/Sprint.js';
import Analysis from '../models/Analysis.js';
import { analyzeText, analyzeSprintContext } from '../utils/groq.js';
import { assertOwned } from '../utils/ownership.js';
import { config } from '../config.js';
import * as analysisService from './analysisService.js';
import { persistSprintUpload } from '../utils/sprintUploadPersistence.js';
import { extractText } from '../utils/textExtraction.js';

export const countUserSprints = async (userId) => {
    return await Sprint.countDocuments({ userId });
};

export const createSprint = async (userId, name, durationDays) => {
    const newSprint = new Sprint({ userId, name, durationDays, uploads: [] });
    return await newSprint.save();
};

export const getSprintsByUser = async (userId) => {
    return await Sprint.find({ userId }).sort({ createdAt: -1 });
};

export const getSprintById = async (sprintId, userId) => {
    const sprint = await Sprint.findById(sprintId).populate('uploads.analysisId');
    assertOwned(sprint, userId);
    return sprint;
};

export const updateExpectedResult = async (sprintId, userId, expectedResult) => {
    const sprint = await Sprint.findById(sprintId);
    assertOwned(sprint, userId);
    
    sprint.expectedResult = expectedResult;
    return await sprint.save();
};

export const deleteSprint = async (sprintId, userId) => {
    const sprint = await Sprint.findById(sprintId);
    assertOwned(sprint, userId);
    
    await Analysis.deleteMany({ sprintId: sprint._id, userId });
    await Sprint.findByIdAndDelete(sprint._id);
};

export const processSprintUpload = async (userId, sprintId, day, fileBuffer, mimetype, originalname) => {
    const sprint = await Sprint.findById(sprintId);
    assertOwned(sprint, userId);
    const dayNumber = Number(day);
    if (!Number.isInteger(dayNumber) || dayNumber < 1 || dayNumber > sprint.durationDays) throw new Error('BAD_REQUEST_DAY');

    const cooldown = await analysisService.checkCooldown(userId);
    if (cooldown.onCooldown) {
        const error = new Error('UPLOAD_COOLDOWN');
        error.remaining = cooldown.remaining;
        throw error;
    }
    let extractedText = await extractText(fileBuffer, mimetype);

    if (!extractedText || extractedText.trim().length === 0) {
        throw new Error('BAD_REQUEST_EMPTY');
    }

    extractedText = extractedText.slice(0, config.aiMaxInputChars);

    // Preparar textos para agregação de contexto ANTES de salvar (para rodar em paralelo)
    const populatedSprintForContext = await Sprint.findById(sprintId).populate('uploads.analysisId');
    const existingUploads = populatedSprintForContext.uploads
        .filter(u => u.analysisId && u.analysisId.originalText && u.day !== dayNumber)
        .map(u => ({ day: u.day, text: u.analysisId.originalText }));
    
    existingUploads.push({ day: dayNumber, text: extractedText });
    existingUploads.sort((a, b) => a.day - b.day);
    const contextText = existingUploads.map(upload => `Dia ${upload.day}:\n${upload.text}`).join('\n\n');
    const allTexts = [contextText.slice(-config.aiMaxSprintContextChars)];

    // Disparar ambas as requisições API em paralelo usando Promise.all para evitar Vercel timeout
    const [aiSummary, globalSummary] = await Promise.all([
        analyzeText(extractedText),
        allTexts.length > 0 ? analyzeSprintContext(allTexts) : Promise.resolve(null)
    ]);

    const newAnalysis = new Analysis({
        userId,
        fileName: originalname,
        fileType: mimetype,
        originalText: extractedText,
        summary: aiSummary,
        sprintId
    });

    await newAnalysis.save();

    const oldAnalysisId = sprint.uploads.find(upload => upload.day === dayNumber)?.analysisId;
    const oldAnalysisIdValue = oldAnalysisId?._id || oldAnalysisId;
    const upload = {
        day: dayNumber,
        analysisId: newAnalysis._id,
        fileName: originalname,
        uploadedAt: new Date()
    };

    try {
        await persistSprintUpload(Sprint, {
            sprintId,
            userId,
            dayNumber,
            upload,
            aggregatedSummary: globalSummary
        });
    } catch (error) {
        await Analysis.findByIdAndDelete(newAnalysis._id).catch(() => {});
        throw error;
    }

    if (oldAnalysisIdValue && String(oldAnalysisIdValue) !== String(newAnalysis._id)) {
        const stillReferenced = await Sprint.exists({ userId, 'uploads.analysisId': oldAnalysisIdValue });
        if (!stillReferenced) await Analysis.findByIdAndDelete(oldAnalysisIdValue).catch(() => {});
    }

    return { 
        sprint: await Sprint.findOne({ _id: sprintId, userId }).populate('uploads.analysisId'), 
        analysis: newAnalysis 
    };
};
