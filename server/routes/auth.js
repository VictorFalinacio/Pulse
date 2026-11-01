import express from 'express';
import rateLimit from 'express-rate-limit';
import * as authController from '../controllers/authController.js';

const router = express.Router();
const sensitiveLimiter = rateLimit({
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
    message: { msg: 'Muitas tentativas de verificação, tente novamente em 15 minutos.' }
});
const registrationLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: { msg: 'Muitas tentativas de cadastro, tente novamente em 15 minutos.' }
});

if (!process.env.JWT_SECRET) {
    console.error('CRITICAL: JWT_SECRET must be set in environment variables');
}

router.post('/register', registrationLimiter, authController.register);
router.post('/login', sensitiveLimiter, authController.login);
router.post('/verify-email', verificationLimiter, authController.verifyEmail);
router.post('/forgot-password', sensitiveLimiter, authController.requestPasswordReset);
router.post('/verify-reset-token', verificationLimiter, authController.verifyResetToken);
router.post('/reset-password', sensitiveLimiter, authController.resetPassword);

export default router;
