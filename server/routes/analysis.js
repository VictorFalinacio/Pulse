import express from 'express';
import multer from 'multer';
import authMiddleware from '../utils/authMiddleware.js';
import * as analysisController from '../controllers/analysisController.js';
import rateLimit from 'express-rate-limit';
import { ALLOWED_UPLOAD_MIME_TYPES } from '../utils/uploadValidation.js';

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (ALLOWED_UPLOAD_MIME_TYPES.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Formato de arquivo não suportado. Use PDF, DOCX ou TXT.'), false);
        }
    }
});

const uploadLimiter = rateLimit({
    windowMs: 60 * 1000, 
    max: 1, 
    message: { msg: 'Aguarde 1 minuto de cooldown entre os uploads' },
    keyGenerator: (req) => req.user?.id || req.ip
});

router.post('/analisar', authMiddleware, uploadLimiter, upload.single('file'), analysisController.analisar);
router.get('/cooldown', authMiddleware, analysisController.getCooldownStatus);
router.get('/historico', authMiddleware, analysisController.getHistory);
router.delete('/:id', authMiddleware, analysisController.deleteAnalysis);

export default router;
