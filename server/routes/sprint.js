import express from 'express';
import multer from 'multer';
import authMiddleware from '../utils/authMiddleware.js';
import rateLimit from 'express-rate-limit';
import * as sprintController from '../controllers/sprintController.js';
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
    message: { msg: 'Aguarde 1 minuto entre os uploads' },
    keyGenerator: (req) => req.user?.id || 'anonymous'
});

// Sprint Routes
router.post('/', authMiddleware, sprintController.createSprint);
router.get('/', authMiddleware, sprintController.getSprints);
router.get('/:id', authMiddleware, sprintController.getSprintById);
router.put('/:id/expected', authMiddleware, sprintController.updateExpectedResult);
router.delete('/:id', authMiddleware, sprintController.deleteSprint);

// Upload to sprint day
router.post('/:id/upload/:day', authMiddleware, uploadLimiter, upload.single('file'), sprintController.uploadSprintData);

export default router;
