import express from 'express';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import validator from 'validator';
import { sendVerificationEmail, sendPasswordResetEmail } from '../utils/mailer.js';
import { validatePasswordStrength } from '../utils/passwordValidator.js';

const router = express.Router();

if (!process.env.JWT_SECRET) {
    console.error('CRITICAL: JWT_SECRET must be set in environment variables');
}

router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;

    try {
        if (!email || !validator.isEmail(email)) {
            return res.status(400).json({ msg: 'Email inválido.' });
        }

        const passwordValidation = validatePasswordStrength(password);
        if (!passwordValidation.isValid) {
            return res.status(400).json({ msg: passwordValidation.errors[0] });
        }

        if (!name || name.trim().length < 2) {
            return res.status(400).json({ msg: 'Nome deve ter pelo menos 2 caracteres.' });
        }

        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ msg: 'Este email já está cadastrado.' });
        }

        const verificationToken = crypto.randomBytes(32).toString('hex');
        const verificationTokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        user = new User({ 
            name, 
            email, 
            password, 
            verificationToken,
            verificationTokenExpiresAt 
        });
        await user.save();

        try {
            await sendVerificationEmail(user.email, verificationToken);
            res.json({ msg: 'Conta criada! Verifique seu email para ativá-la.' });
        } catch (mailError) {
            // Log error only in development
            if (process.env.NODE_ENV === 'development') {
                console.error("Erro ao enviar email de verificação", mailError);
            }
            res.status(500).json({ msg: 'Erro ao enviar email de verificação.' });
        }
    } catch (err) {
        if (process.env.NODE_ENV === 'development') {
            console.error(err);
        }
        res.status(500).json({ msg: 'Erro Interno do Servidor' });
    }
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        if (!email || !password) {
            return res.status(400).json({ msg: 'Email e senha são obrigatórios.' });
        }

        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ msg: 'Email ou senha inválidos.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Email ou senha inválidos.' });
        }

        if (!user.isVerified) {
            return res.status(403).json({ msg: 'Sua conta não foi verificada. Cheque seu email.' });
        }

        if (!process.env.JWT_SECRET) {
            throw new Error('JWT_SECRET not configured');
        }

        const payload = { user: { id: user.id, name: user.name, email: user.email } };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '30m' });

        res.json({ token, user: payload.user });
    } catch (err) {
        if (process.env.NODE_ENV === 'development') {
            console.error(err);
        }
        res.status(500).json({ msg: 'Erro Interno do Servidor' });
    }
});

router.post('/verify-email', async (req, res) => {
    const { token } = req.body;

    try {
        if (!token) {
            return res.status(400).json({ msg: 'Token é obrigatório.' });
        }

        const user = await User.findOne({ 
            verificationToken: token,
            verificationTokenExpiresAt: { $gt: new Date() }
        });

        if (!user) {
            return res.status(400).json({ msg: 'Token inválido ou expirado.' });
        }

        user.isVerified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpiresAt = undefined;
        await user.save();
        
        res.json({ msg: 'Email verificado com sucesso! Você já pode fazer login.' });
    } catch (err) {
        if (process.env.NODE_ENV === 'development') {
            console.error(err);
        }
        res.status(500).json({ msg: 'Erro ao verificar email.' });
    }
});

// Keep GET endpoint for backward compatibility with email links
router.get('/verify/:token', async (req, res) => {
    try {
        const user = await User.findOne({ 
            verificationToken: req.params.token,
            verificationTokenExpiresAt: { $gt: new Date() }
        });

        if (!user) {
            return res.status(400).json({ msg: 'Token inválido ou expirado.' });
        }

        user.isVerified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpiresAt = undefined;
        await user.save();
        
        // Return JSON response instead of redirect to allow frontend to handle it
        res.json({ msg: 'Email verificado com sucesso! Você já pode fazer login.' });
    } catch (err) {
        if (process.env.NODE_ENV === 'development') {
            console.error(err);
        }
        res.status(500).json({ msg: 'Erro ao verificar email.' });
    }
});

// Request Password Reset
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email || !validator.isEmail(email)) {
            return res.status(400).json({ msg: 'Email inválido.' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            // Don't reveal if email exists for security
            return res.status(200).json({ msg: 'Se o email existe, você receberá um link.' });
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpire = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour

        await user.save();

        try {
            await sendPasswordResetEmail(user.email, resetToken);
            res.json({ msg: 'Email de recuperação enviado!' });
        } catch (err) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
            await user.save();
            if (process.env.NODE_ENV === 'development') {
                console.error(err);
            }
            res.status(500).json({ msg: 'Erro ao enviar email.' });
        }
    } catch (err) {
        if (process.env.NODE_ENV === 'development') {
            console.error(err);
        }
        res.status(500).json({ msg: 'Erro no servidor' });
    }
});

// Verify reset password token - POST method for security
router.post('/verify-reset-token', async (req, res) => {
    const { token } = req.body;

    try {
        if (!token) {
            return res.status(400).json({ msg: 'Token é obrigatório.' });
        }

        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpire: { $gt: new Date() }
        });

        if (!user) {
            return res.status(400).json({ msg: 'Token inválido ou expirado.' });
        }

        res.json({ msg: 'Token válido.' });
    } catch (err) {
        res.status(500).json({ msg: 'Erro ao verificar token.' });
    }
});

// Reset the actual password - POST with token in body
router.post('/reset-password', async (req, res) => {
    const { token, password } = req.body;

    try {
        if (!token || !password) {
            return res.status(400).json({ msg: 'Token e senha são obrigatórios.' });
        }

        // Validate new password strength
        const passwordValidation = validatePasswordStrength(password);
        if (!passwordValidation.isValid) {
            return res.status(400).json({ msg: passwordValidation.errors[0] });
        }

        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpire: { $gt: new Date() }
        });

        if (!user) {
            return res.status(400).json({ msg: 'Token inválido ou expirado.' });
        }

        user.password = password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save();
        res.json({ msg: 'Sua senha foi redefinida com sucesso!' });
    } catch (err) {
        if (process.env.NODE_ENV === 'development') {
            console.error(err);
        }
        res.status(500).json({ msg: 'Erro ao redefinir a senha' });
    }
});

// Keep old endpoint for backward compatibility
router.post('/reset-password/:token', async (req, res) => {
    try {
        const passwordValidation = validatePasswordStrength(req.body.password);
        if (!passwordValidation.isValid) {
            return res.status(400).json({ msg: passwordValidation.errors[0] });
        }

        const user = await User.findOne({
            resetPasswordToken: req.params.token,
            resetPasswordExpire: { $gt: new Date() }
        });

        if (!user) return res.status(400).json({ msg: 'Token inválido ou expirado.' });

        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save();
        res.json({ msg: 'Sua senha foi redefinida com sucesso!' });
    } catch (err) {
        if (process.env.NODE_ENV === 'development') {
            console.error(err);
        }
        res.status(500).json({ msg: 'Erro ao redefinir a senha' });
    }
});

export default router;
