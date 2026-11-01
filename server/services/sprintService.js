import Sprint from '../models/Sprint.js';
import Analysis from '../models/Analysis.js';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import { analyzeText, analyzeSprintContext } from '../utils/gemini.js';
import { assertOwned } from '../utils/ownership.js';
import { config } from '../config.js';
import { normalizeFileName } from '../utils/fileName.js';

export const countUserSprints = async userId => Sprint.countDocuments({ userId });
export const createSprint = async (userId, name, durationDays) => new Sprint({ userId, name, durationDays, uploads: [] }).save();
export const getSprintsByUser = async userId => Sprint.find({ userId }).sort({ createdAt: -1 });
export const getSprintById = async (sprintId, userId) => { const sprint = await Sprint.findById(sprintId).populate('uploads.analysisId'); assertOwned(sprint, userId); return sprint; };
export const updateExpectedResult = async (sprintId, userId, expectedResult) => { const sprint = await Sprint.findById(sprintId); assertOwned(sprint, userId); sprint.expectedResult = expectedResult; return sprint.save(); };
export const deleteSprint = async (sprintId, userId) => { const sprint = await Sprint.findById(sprintId); assertOwned(sprint, userId); await Analysis.deleteMany({ sprintId: sprint._id, userId }); await Sprint.findByIdAndDelete(sprint._id); };

export const processSprintUpload = async (userId, sprintId, day, fileBuffer, mimetype, originalname) => {
    const sprint = await Sprint.findOne({ _id: sprintId, userId });
    assertOwned(sprint, userId);
    const dayNumber = Number(day);
    if (!Number.isInteger(dayNumber) || dayNumber < 1 || dayNumber > sprint.durationDays) throw new Error('BAD_REQUEST_DAY');
    let extractedText = '';
    if (mimetype === 'application/pdf') extractedText = (await pdfParse(fileBuffer)).text;
    else if (mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') extractedText = (await mammoth.extractRawText({ buffer: fileBuffer })).value;
    else if (mimetype === 'text/plain') extractedText = fileBuffer.toString('utf-8');
    if (!extractedText.trim()) throw new Error('BAD_REQUEST_EMPTY');
    extractedText = extractedText.slice(0, config.geminiMaxInputChars);
    const aiSummary = await analyzeText(extractedText);
    const normalizedFileName = normalizeFileName(originalname);
    const newAnalysis = await new Analysis({ userId, fileName: normalizedFileName, fileType: mimetype, originalText: extractedText, summary: aiSummary, sprintId }).save();
    const upload = { day: dayNumber, analysisId: newAnalysis._id, fileName: normalizedFileName, uploadedAt: new Date() };
    const oldUpload = (sprint.uploads || []).find(item => item.day === dayNumber);
    const updated = oldUpload ? await Sprint.findOneAndUpdate({ _id: sprint._id, userId, 'uploads.day': dayNumber }, { $set: { 'uploads.$': upload } }, { new: true, runValidators: true }) : await Sprint.findOneAndUpdate({ _id: sprint._id, userId }, { $push: { uploads: upload } }, { new: true, runValidators: true });
    if (!updated) { await Analysis.findByIdAndDelete(newAnalysis._id).catch(() => {}); throw new Error('SPRINT_NOT_FOUND'); }
    if (oldUpload?.analysisId) await Analysis.findByIdAndDelete(oldUpload.analysisId).catch(() => {});
    let summaryUpdated = false;
    try {
        const current = await Sprint.findById(sprintId).populate('uploads.analysisId');
        const text = (current.uploads || []).filter(item => item.analysisId?.originalText).sort((a, b) => a.day - b.day).map(item => `Dia ${item.day}:\n${item.analysisId.originalText}`).join('\n\n');
        let summary = await analyzeSprintContext([text.slice(-config.geminiMaxSprintContextChars)]);
        const dates = (current.uploads || []).map(item => new Date(item.uploadedAt)).filter(date => !Number.isNaN(date.getTime())).sort((a, b) => a - b);
        if (dates.length) {
            const formatDate = date => date.toLocaleDateString('pt-BR', { timeZone: 'UTC' });
            summary = `**Período analisado:** ${formatDate(dates[0])} a ${formatDate(dates[dates.length - 1])}\n\n${summary}`;
        }
        summaryUpdated = (await Sprint.updateOne({ _id: sprintId, userId }, { $set: { aggregatedSummary: summary } })).matchedCount === 1;
    } catch (error) { console.warn('Sprint summary refresh failed:', error.message); }
    return { sprint: await Sprint.findById(sprintId).populate('uploads.analysisId'), analysis: newAnalysis, summaryUpdated };
};
