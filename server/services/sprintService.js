import Sprint from '../models/Sprint.js';
import Analysis from '../models/Analysis.js';
import { analyzeText, analyzeSprintContext } from '../utils/gemini.js';
import { assertOwned } from '../utils/ownership.js';
import { config } from '../config.js';
import { extractText } from '../utils/extractText.js';
import { log } from '../utils/logger.js';
import { normalizeFileName } from '../utils/fileName.js';

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
    const sprint = await Sprint.findById(sprintId).populate('uploads.analysisId');
    assertOwned(sprint, userId);
    const dayNumber = Number(day);
    if (!Number.isInteger(dayNumber) || dayNumber < 1 || dayNumber > sprint.durationDays) throw new Error('BAD_REQUEST_DAY');

    let extractedText;
    try {
        extractedText = await extractText(fileBuffer, mimetype);
    } catch (error) {
        if (error.message === 'EMPTY_FILE') throw new Error('BAD_REQUEST_EMPTY');
        throw error;
    }

    const initialRevision = sprint.contextRevision || 0;
    const contextUploads = sprint.uploads
        .filter(item => item.analysisId?.originalText && item.day !== dayNumber)
        .map(item => ({ day: item.day, text: item.analysisId.originalText }));
    contextUploads.push({ day: dayNumber, text: extractedText });
    contextUploads.sort((a, b) => a.day - b.day);
    const initialContext = contextUploads.map(item => `Dia ${item.day}:\n${item.text}`).join('\n\n');
    const boundedInitialContext = initialContext.slice(-config.geminiMaxSprintContextChars);

    // The individual report is required for the upload. Consolidation is a
    // secondary operation and must not discard a valid meeting when Gemini
    // rejects the larger context or times out.
    const [analysisResult, contextResult] = await Promise.allSettled([
        analyzeText(extractedText),
        analyzeSprintContext([boundedInitialContext])
    ]);
    if (analysisResult.status === 'rejected') throw analysisResult.reason;
    let aiSummary = analysisResult.value;
    let globalSummary = contextResult.status === 'fulfilled' ? contextResult.value : null;

    const newAnalysis = new Analysis({
        userId,
        fileName: normalizeFileName(originalname),
        fileType: mimetype,
        originalText: extractedText,
        summary: aiSummary,
        sprintId
    });

    await newAnalysis.save();

    const uploadedAt = new Date();
    const normalizedFileName = normalizeFileName(originalname);
    const upload = { day: dayNumber, analysisId: newAnalysis._id, fileName: normalizedFileName, uploadedAt };
    const updated = await Sprint.findOneAndUpdate(
        { _id: sprint._id, userId },
        [{ $set: {
            uploads: {
                $concatArrays: [
                    { $filter: { input: { $ifNull: ['$uploads', []] }, as: 'upload', cond: { $ne: ['$$upload.day', dayNumber] } } },
                    [upload]
                ]
            },
            contextRevision: { $add: [{ $ifNull: ['$contextRevision', 0] }, 1] }
        } }],
        { new: true }
    );
    if (!updated) {
        await Analysis.findByIdAndDelete(newAnalysis._id);
        throw new Error('SPRINT_NOT_FOUND');
    }

    const previousDayUpload = sprint.uploads.find(item => item.day === dayNumber);
    if (previousDayUpload?.analysisId) {
        await Analysis.findByIdAndDelete(previousDayUpload.analysisId).catch(() => {});
    }

    // If another upload committed while Gemini was working, recompute from the
    // committed sprint so the consolidated report includes both changes.
    let summaryUpdated = false;
    try {
        if (updated.contextRevision !== initialRevision + 1) {
            const sprintForContext = await Sprint.findById(sprintId).populate('uploads.analysisId');
            if (!sprintForContext) throw new Error('SPRINT_NOT_FOUND');
            const latestUploads = sprintForContext.uploads
                .filter(item => item.analysisId?.originalText)
                .sort((a, b) => a.day - b.day)
                .map(item => ({ day: item.day, text: item.analysisId.originalText }));
            const latestContext = latestUploads.map(item => `Dia ${item.day}:\n${item.text}`).join('\n\n');
            globalSummary = await analyzeSprintContext([latestContext.slice(-config.geminiMaxSprintContextChars)]);
        }
        if (globalSummary) {
            const result = await Sprint.updateOne(
                { _id: sprintId, userId, contextRevision: updated.contextRevision },
                { $set: { aggregatedSummary: globalSummary } }
            );
            summaryUpdated = result.matchedCount === 1;
        }
    } catch (error) {
        log('warn', 'sprint_summary_refresh_failed', { sprintId: String(sprintId), message: error.message });
    }

    return { 
        sprint: await Sprint.findById(sprintId).populate('uploads.analysisId'),
        analysis: newAnalysis,
        summaryUpdated
    };
};
