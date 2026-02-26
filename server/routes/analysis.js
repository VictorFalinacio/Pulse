import express from 'express';
import multer from 'multer';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import Analysis from '../models/Analysis.js';
import { analyzeText } from '../utils/gemini.js';
import authMiddleware from '../utils/authMiddleware.js';

const router = express.Router();

// Configuration for Multer (Memory Storage)
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

router.post('/analisar', authMiddleware, upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ msg: 'Por favor, envie um arquivo.' });
        }

        const { originalname, mimetype, buffer } = req.file;
        console.log(`Recebido arquivo: ${originalname} (${mimetype})`);
        let extractedText = '';

        // Extraction Logic based on MIME type
        try {
            if (mimetype === 'application/pdf') {
                console.log('Extraindo texto de PDF usando pdf-parse...');
                const pdfData = await pdfParse(buffer);
                extractedText = pdfData.text;
            } else if (mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
                console.log('Extraindo texto de DOCX...');
                const result = await mammoth.extractRawText({ buffer: buffer });
                extractedText = result.value;
            } else if (mimetype === 'text/plain') {
                console.log('Extraindo texto de TXT...');
                extractedText = buffer.toString('utf-8');
            } else {
                return res.status(400).json({ msg: 'Formato de arquivo não suportado. Use PDF, DOCX ou TXT.' });
            }
        } catch (extractError) {
            console.error('Erro na extração de texto:', extractError);
            return res.status(400).json({ msg: 'Falha ao ler o conteúdo do arquivo.', error: extractError.message });
        }

        if (!extractedText || extractedText.trim().length === 0) {
            console.warn('Arquivo vazio ou sem texto detectável.');
            return res.status(400).json({ msg: 'Não foi possível extrair texto do arquivo (arquivo vazio ou sem texto).' });
        }

        console.log(`Texto extraído (${extractedText.length} caracteres). Enviando para Gemini...`);

        // AI Analysis
        const aiSummary = await analyzeText(extractedText);
        console.log('Análise da IA recebida com sucesso.');

        // Save to MongoDB
        const newAnalysis = new Analysis({
            userId: req.user.id,
            fileName: originalname,
            fileType: mimetype,
            originalText: extractedText,
            summary: aiSummary
        });

        await newAnalysis.save();
        console.log('Análise salva no MongoDB.');

        res.json(newAnalysis);

    } catch (error) {
        console.error('Analysis Route Error:', error);
        res.status(500).json({ msg: 'Erro ao processar o arquivo.', error: error.message });
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
        console.log('DELETE request for analysis:', req.params.id);
        console.log('User from token:', JSON.stringify(req.user));

        const analysis = await Analysis.findById(req.params.id);

        if (!analysis) {
            console.log('Analysis not found');
            return res.status(404).json({ msg: 'Análise não encontrada.' });
        }

        // Check ownership - handle different JWT payload structures
        const userId = req.user.id || req.user._id;
        console.log('Analysis userId:', analysis.userId.toString(), 'Token userId:', userId);

        if (analysis.userId.toString() !== userId) {
            console.log('Ownership check failed');
            return res.status(401).json({ msg: 'Não autorizado para excluir esta análise.' });
        }

        await Analysis.findByIdAndDelete(req.params.id);
        console.log('Analysis deleted successfully');
        res.json({ msg: 'Análise excluída com sucesso.' });
    } catch (error) {
        console.error('Delete Analysis Error:', error);
        res.status(500).json({ msg: 'Erro ao excluir a análise.' });
    }
});

export default router;
