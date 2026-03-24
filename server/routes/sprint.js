import express from 'express';
import multer from 'multer';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import Sprint from '../models/Sprint.js';
import Analysis from '../models/Analysis.js';
import { analyzeText, analyzeSprintContext } from '../utils/gemini.js';
import authMiddleware from '../utils/authMiddleware.js';
import rateLimit from 'express-rate-limit';

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowedMimes = [
            'application/pdf',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'text/plain'
        ];

        if (allowedMimes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Formato de arquivo não suportado. Use PDF, DOCX ou TXT.'), false);
        }
    }
});

const validateFileMagicBytes = (buffer, mimetype) => {
    const pdf = buffer.slice(0, 4).toString('hex').startsWith('25504446');
    const docx = buffer.slice(0, 4).equals(Buffer.from([0x50, 0x4b, 0x03, 0x04]));

    if (mimetype === 'application/pdf' && !pdf) {
        return false;
    }
    if (mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' && !docx) {
        return false;
    }
    return true;
};

// Create Sprint
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { name, durationDays } = req.body;

        if (!name || !durationDays) {
            return res.status(400).json({ msg: 'Nome e duração são obrigatórios.' });
        }

        if (durationDays > 14) {
            return res.status(400).json({ msg: 'A duração máxima é de 14 dias.' });
        }

        const sprintCount = await Sprint.countDocuments({ userId: req.user.id });
        if (sprintCount >= 5) {
            return res.status(400).json({ msg: 'O limite máximo de 5 sprints foi atingido.' });
        }

        const newSprint = new Sprint({
            userId: req.user.id,
            name,
            durationDays,
            uploads: []
        });

        await newSprint.save();
        res.json(newSprint);
    } catch (error) {
        res.status(500).json({ msg: 'Erro ao criar sprint.' });
    }
});

// Get all sprints for user
router.get('/', authMiddleware, async (req, res) => {
    try {
        const sprints = await Sprint.find({ userId: req.user.id }).sort({ createdAt: -1 });
        res.json(sprints);
    } catch (error) {
        res.status(500).json({ msg: 'Erro ao buscar sprints.' });
    }
});

// Get specific sprint
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const sprint = await Sprint.findById(req.params.id).populate('uploads.analysisId');
        if (!sprint) {
            return res.status(404).json({ msg: 'Sprint não encontrada.' });
        }
        if (sprint.userId.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Não autorizado.' });
        }
        res.json(sprint);
    } catch (error) {
        res.status(500).json({ msg: 'Erro ao buscar sprint.' });
    }
});

// Update expected result
router.put('/:id/expected', authMiddleware, async (req, res) => {
    try {
        const { expectedResult } = req.body;
        const sprint = await Sprint.findById(req.params.id);

        if (!sprint) return res.status(404).json({ msg: 'Sprint não encontrada.' });
        if (sprint.userId.toString() !== req.user.id) return res.status(401).json({ msg: 'Não autorizado.' });

        sprint.expectedResult = expectedResult;
        await sprint.save();
        res.json(sprint);
    } catch (error) {
        res.status(500).json({ msg: 'Erro ao atualizar resultado esperado.' });
    }
});

const uploadLimiter = rateLimit({
    windowMs: 60 * 1000, 
    max: 1, 
    message: { msg: 'Aguarde 1 minuto entre os uploads' },
    keyGenerator: (req) => req.user?.id || req.ip
});

// Upload to sprint day
router.post('/:id/upload/:day', authMiddleware, uploadLimiter, upload.single('file'), async (req, res) => {
    try {
        const { id, day } = req.params;
        const sprint = await Sprint.findById(id);

        if (!sprint) return res.status(404).json({ msg: 'Sprint não encontrada.' });
        if (sprint.userId.toString() !== req.user.id) return res.status(401).json({ msg: 'Não autorizado.' });
        if (day < 1 || day > sprint.durationDays) return res.status(400).json({ msg: 'Dia inválido para esta sprint.' });

        if (!req.file) {
            return res.status(400).json({ msg: 'Por favor, envie um arquivo.' });
        }

        const { originalname, mimetype, buffer } = req.file;

        if (!validateFileMagicBytes(buffer, mimetype)) {
            return res.status(400).json({ msg: 'Arquivo inválido ou corrompido.' });
        }

        let extractedText = '';
        if (mimetype === 'application/pdf') {
            const pdfData = await pdfParse(buffer);
            extractedText = pdfData.text;
        } else if (mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            const result = await mammoth.extractRawText({ buffer: buffer });
            extractedText = result.value;
        } else if (mimetype === 'text/plain') {
            extractedText = buffer.toString('utf-8');
        }

        if (!extractedText || extractedText.trim().length === 0) {
            return res.status(400).json({ msg: 'Não foi possível extrair texto do arquivo.' });
        }

        if (extractedText.length > 50000) {
            extractedText = extractedText.substring(0, 50000);
        }

        const aiSummary = await analyzeText(extractedText);

        const newAnalysis = new Analysis({
            userId: req.user.id,
            fileName: originalname,
            fileType: mimetype,
            originalText: extractedText,
            summary: aiSummary,
            sprintId: id
        });

        await newAnalysis.save();

        // Update sprint uploads - if day already exists, update it
        const uploadIndex = sprint.uploads.findIndex(u => u.day == day);
        if (uploadIndex > -1) {
            // Delete the old Analysis to avoid orphaned documents
            const oldAnalysisId = sprint.uploads[uploadIndex].analysisId;
            if (oldAnalysisId) {
                await Analysis.findByIdAndDelete(oldAnalysisId).catch(err =>
                    console.error('Error deleting old analysis:', err)
                );
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

        // Generate Aggregated Summary
        try {
            // Re-fetch sprint with populated analyses after saving uploads
            const populatedSprint = await Sprint.findById(id).populate('uploads.analysisId');
            const allTexts = populatedSprint.uploads
                .filter(u => u.analysisId && u.analysisId.originalText)
                .sort((a, b) => a.day - b.day)
                .map(u => `Dia ${u.day}:\n${u.analysisId.originalText}`);

            if (allTexts.length > 0) {
                const globalSummary = await analyzeSprintContext(allTexts);
                // Update aggregatedSummary directly by ID to avoid stale instance issues
                await Sprint.findByIdAndUpdate(id, { aggregatedSummary: globalSummary });
            }
        } catch (aggError) {
            console.error('Error generating aggregated summary (non-blocking):', aggError.message || aggError);
            // Non-blocking: sprint upload still succeeds even if summary generation fails
        }

        const finalSprint = await Sprint.findById(id).populate('uploads.analysisId');
        res.json({ sprint: finalSprint, analysis: newAnalysis });

    } catch (error) {
        console.error('Sprint Upload Error:', error);
        res.status(500).json({ msg: 'Erro ao processar o upload da sprint.' });
    }
});

// Delete Sprint
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const sprint = await Sprint.findById(req.params.id);
        if (!sprint) return res.status(404).json({ msg: 'Sprint não encontrada.' });
        if (sprint.userId.toString() !== req.user.id) return res.status(401).json({ msg: 'Não autorizado.' });

        await Sprint.findByIdAndDelete(req.params.id);
        res.json({ msg: 'Sprint excluída com sucesso.' });
    } catch (error) {
        res.status(500).json({ msg: 'Erro ao excluir sprint.' });
    }
});

export default router;
