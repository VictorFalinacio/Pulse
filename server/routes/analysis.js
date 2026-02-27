import express from 'express';
import multer from 'multer';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import Analysis from '../models/Analysis.js';
import { analyzeText } from '../utils/gemini.js';
import authMiddleware from '../utils/authMiddleware.js';

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
    const txt = true;
    
    if (mimetype === 'application/pdf' && !pdf) {
        return false;
    }
    if (mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' && !docx) {
        return false;
    }
    return true;
};

router.post('/analisar', authMiddleware, upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ msg: 'Por favor, envie um arquivo.' });
        }

        const { originalname, mimetype, buffer } = req.file;
        
        // Log only non-sensitive info in development
        if (process.env.NODE_ENV === 'development') {
            console.log(`Processing file: ${originalname.substring(0, 20)}...`);
        }

        let extractedText = '';

        // Validate magic bytes
        if (!validateFileMagicBytes(buffer, mimetype)) {
            return res.status(400).json({ msg: 'Arquivo inválido ou corrompido.' });
        }

        // Extraction Logic based on MIME type
        try {
            if (mimetype === 'application/pdf') {
                const pdfData = await pdfParse(buffer);
                extractedText = pdfData.text;
            } else if (mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
                const result = await mammoth.extractRawText({ buffer: buffer });
                extractedText = result.value;
            } else if (mimetype === 'text/plain') {
                extractedText = buffer.toString('utf-8');
            } else {
                return res.status(400).json({ msg: 'Formato de arquivo não suportado. Use PDF, DOCX ou TXT.' });
            }
        } catch (extractError) {
            if (process.env.NODE_ENV === 'development') {
                console.error('Erro na extração de texto:', extractError);
            }
            return res.status(400).json({ msg: 'Falha ao ler o conteúdo do arquivo.' });
        }

        if (!extractedText || extractedText.trim().length === 0) {
            return res.status(400).json({ msg: 'Não foi possível extrair texto do arquivo (arquivo vazio ou sem texto).' });
        }

        // Limit text length for API
        if (extractedText.length > 50000) {
            extractedText = extractedText.substring(0, 50000);
        }

        // AI Analysis with timeout
        let aiSummary;
        try {
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Análise expirou')), 30000) // 30 seconds timeout
            );
            aiSummary = await Promise.race([
                analyzeText(extractedText),
                timeoutPromise
            ]);
        } catch (analysisError) {
            if (process.env.NODE_ENV === 'development') {
                console.error('Analysis timeout or error:', analysisError.message);
            }
            return res.status(500).json({ msg: 'Análise levou muito tempo. Tente um arquivo menor.' });
        }

        // Save to MongoDB
        const newAnalysis = new Analysis({
            userId: req.user.id,
            fileName: originalname,
            fileType: mimetype,
            originalText: extractedText,
            summary: aiSummary
        });

        await newAnalysis.save();

        res.json(newAnalysis);

    } catch (error) {
        if (process.env.NODE_ENV === 'development') {
            console.error('Analysis Route Error:', error.message);
        }
        res.status(500).json({ msg: 'Erro ao processar o arquivo.' });
    }
});

// Route to get previous analyses for the user
router.get('/historico', authMiddleware, async (req, res) => {
    try {
        const history = await Analysis.find({ userId: req.user.id }).sort({ createdAt: -1 });
        res.json(history);
    } catch (error) {
        res.status(500).json({ msg: 'Erro ao buscar histórico.' });
    }
});

// Route to delete an analysis
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const analysis = await Analysis.findById(req.params.id);

        if (!analysis) {
            return res.status(404).json({ msg: 'Análise não encontrada.' });
        }

        // Check ownership
        const userId = req.user.id || req.user._id;
        if (analysis.userId.toString() !== userId) {
            return res.status(401).json({ msg: 'Não autorizado para excluir esta análise.' });
        }

        await Analysis.findByIdAndDelete(req.params.id);
        res.json({ msg: 'Análise excluída com sucesso.' });
    } catch (error) {
        if (process.env.NODE_ENV === 'development') {
            console.error('Delete Analysis Error:', error);
        }
        res.status(500).json({ msg: 'Erro ao excluir a análise.' });
    }
});

export default router;
