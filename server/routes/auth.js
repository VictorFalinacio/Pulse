import express from 'express';
import * as authController from '../controllers/authController.js';

const router = express.Router();

if (!process.env.JWT_SECRET) {
    console.error('CRITICAL: JWT_SECRET must be set in environment variables');
}

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/verify-email', authController.verifyEmail);
router.post('/forgot-password', authController.requestPasswordReset);
router.post('/verify-reset-token', authController.verifyResetToken);
router.post('/reset-password', authController.resetPassword);

export default router;
