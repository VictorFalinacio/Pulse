import Sprint from '../models/Sprint.js';
import Analysis from '../models/Analysis.js';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import { analyzeText, analyzeSprintContext } from '../utils/gemini.js';

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
    if (!sprint) throw new Error('NOT_FOUND');
    if (sprint.userId.toString() !== userId) throw new Error('UNAUTHORIZED');
    return sprint;
};

export const updateExpectedResult = async (sprintId, userId, expectedResult) => {
    const sprint = await Sprint.findById(sprintId);
    if (!sprint) throw new Error('NOT_FOUND');
    if (sprint.userId.toString() !== userId) throw new Error('UNAUTHORIZED');
    
    sprint.expectedResult = expectedResult;
    return await sprint.save();
};

export const deleteSprint = async (sprintId, userId) => {
    const sprint = await Sprint.findById(sprintId);
    if (!sprint) throw new Error('NOT_FOUND');
    if (sprint.userId.toString() !== userId) throw new Error('UNAUTHORIZED');
    
    await Sprint.findByIdAndDelete(sprintId);
};

export const processSprintUpload = async (userId, sprintId, day, fileBuffer, mimetype, originalname) => {
    const sprint = await Sprint.findById(sprintId);
    if (!sprint) throw new Error('NOT_FOUND');
    if (sprint.userId.toString() !== userId) throw new Error('UNAUTHORIZED');
    if (day < 1 || day > sprint.durationDays) throw new Error('BAD_REQUEST_DAY');

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

    const uploadIndex = sprint.uploads.findIndex(u => u.day == day);
    if (uploadIndex > -1) {
        const oldAnalysisId = sprint.uploads[uploadIndex].analysisId;
        if (oldAnalysisId) {
            await Analysis.findByIdAndDelete(oldAnalysisId).catch(() => {});
        }
        sprint.uploads[uploadIndex] = {
            day: parseInt(day),
            analysisId: newAnalysis._id,
            fileName: originalname,
            uploadedAt: new Date()
        };
    } else {
        sprint.uploads.push({
            day: parseInt(day),
            analysisId: newAnalysis._id,
            fileName: originalname,
            uploadedAt: new Date()
        });
    }

    sprint.markModified('uploads');
    await sprint.save();

    // Aggregated Summary Logic
    try {
        const populatedSprint = await Sprint.findById(sprintId).populate('uploads.analysisId');
        const allTexts = populatedSprint.uploads
            .filter(u => u.analysisId && u.analysisId.originalText)
            .sort((a, b) => a.day - b.day)
            .map(u => `Dia ${u.day}:\n${u.analysisId.originalText}`);

        if (allTexts.length > 0) {
            const globalSummary = await analyzeSprintContext(allTexts);
            await Sprint.findByIdAndUpdate(sprintId, { aggregatedSummary: globalSummary });
        }
    } catch (aggError) {
        console.error('Error generating aggregated summary', aggError);
    }

    return { 
        sprint: await Sprint.findById(sprintId).populate('uploads.analysisId'), 
        analysis: newAnalysis 
    };
};
