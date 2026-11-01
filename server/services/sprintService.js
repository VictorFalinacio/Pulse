import Sprint from '../models/Sprint.js';
import Analysis from '../models/Analysis.js';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import { analyzeText, analyzeSprintContext } from '../utils/gemini.js';
import { assertOwned } from '../utils/ownership.js';
import { config } from '../config.js';

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
    const sprint = await Sprint.findOne({ _id: sprintId, userId });
    assertOwned(sprint, userId);
    const dayNumber = Number(day);
    if (!Number.isInteger(dayNumber) || dayNumber < 1 || dayNumber > sprint.durationDays) throw new Error('BAD_REQUEST_DAY');

    let extractedText = '';
    if (mimetype === 'application/pdf') {
        const pdfData = await pdfParse(fileBuffer);
        extractedText = pdfData.text;
    } else if (mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        const result = await mammoth.extractRawText({ buffer: fileBuffer });
        extractedText = result.value;
    } else if (mimetype === 'text/plain') {
        extractedText = fileBuffer.toString('utf-8');
    }

    if (!extractedText || extractedText.trim().length === 0) {
        throw new Error('BAD_REQUEST_EMPTY');
    }

    if (extractedText.length > 50000) {
        extractedText = extractedText.substring(0, 50000);
    }

    // A análise da reunião é o requisito do upload. O resumo consolidado é
    // secundário e não pode fazer o upload inteiro falhar.
    const aiSummary = await analyzeText(extractedText);

    const newAnalysis = new Analysis({
        userId,
        fileName: originalname,
        fileType: mimetype,
        originalText: extractedText,
        summary: aiSummary,
        sprintId
    });

    await newAnalysis.save();

    const upload = { day: dayNumber, analysisId: newAnalysis._id, fileName: originalname, uploadedAt: new Date() };
    const oldUpload = (sprint.uploads || []).find(item => item.day === dayNumber);
    const updated = oldUpload
        ? await Sprint.findOneAndUpdate(
            { _id: sprint._id, userId, 'uploads.day': dayNumber },
            { $set: { 'uploads.$': upload }, $inc: { contextRevision: 1 } },
            { new: true, runValidators: true }
        )
        : await Sprint.findOneAndUpdate(
            { _id: sprint._id, userId },
            { $push: { uploads: upload }, $inc: { contextRevision: 1 } },
            { new: true, runValidators: true }
        );
    if (!updated) {
        await Analysis.findByIdAndDelete(newAnalysis._id).catch(() => {});
        throw new Error('SPRINT_NOT_FOUND');
    }
    if (oldUpload?.analysisId) await Analysis.findByIdAndDelete(oldUpload.analysisId).catch(() => {});

    let summaryUpdated = false;
    try {
        const current = await Sprint.findById(sprintId).populate('uploads.analysisId');
        const texts = (current.uploads || [])
            .filter(item => item.analysisId?.originalText)
            .sort((a, b) => a.day - b.day)
            .map(item => `Dia ${item.day}:\n${item.analysisId.originalText}`)
            .join('\n\n');
        const globalSummary = await analyzeSprintContext([texts.slice(-config.geminiMaxSprintContextChars)]);
        const result = await Sprint.updateOne({ _id: sprintId, userId }, { $set: { aggregatedSummary: globalSummary } });
        summaryUpdated = result.matchedCount === 1;
    } catch (error) {
        console.warn('Sprint summary refresh failed:', error.message);
    }

    return { 
        sprint: await Sprint.findById(sprintId).populate('uploads.analysisId'), 
        analysis: newAnalysis,
        summaryUpdated
    };
};
