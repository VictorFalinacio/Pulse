import express from 'express';
import * as authController from '../controllers/authController.js';
import rateLimit from 'express-rate-limit';

const router = express.Router();

if (!process.env.JWT_SECRET) {
    console.error('CRITICAL: JWT_SECRET must be set in environment variables');
}

router.post('/register', authController.register);
const strictAuthLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: { msg: 'Muitas tentativas de autenticação, tente novamente em 15 minutos.' }
});
const verificationLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 30,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: { msg: 'Muitas tentativas de verificação, tente novamente mais tarde.' }
});

router.post('/register', strictAuthLimiter, authController.register);
router.post('/login', strictAuthLimiter, authController.login);
router.post('/verify-email', verificationLimiter, authController.verifyEmail);
router.post('/forgot-password', strictAuthLimiter, authController.requestPasswordReset);
router.post('/verify-reset-token', verificationLimiter, authController.verifyResetToken);
router.post('/reset-password', strictAuthLimiter, authController.resetPassword);

export default router;
