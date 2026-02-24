import express from 'express';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { sendVerificationEmail, sendPasswordResetEmail } from '../utils/mailer.js';

const router = express.Router();

router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;

    try {
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ msg: 'Este email já está cadastrado.' });
        }

        const verificationToken = crypto.randomBytes(32).toString('hex');

        user = new User({ name, email, password, verificationToken });
        await user.save();

        try {
            await sendVerificationEmail(user.email, verificationToken);
            res.json({ msg: 'Conta criada! Verifique seu email para ativá-la.' });
        } catch (mailError) {
            console.error("Erro ao enviar email de verificação", mailError);
            res.status(500).json({ msg: 'Erro ao enviar email de verificação.' });
        }
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Erro Interno do Servidor' });
    }
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
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

        const payload = { user: { id: user.id, name: user.name, email: user.email } };
        const token = jwt.sign(payload, process.env.JWT_SECRET || 'supersecretkey', { expiresIn: '8h' });

        res.json({ token, user: payload.user });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Erro Interno do Servidor' });
    }
});

// Endpoint to verify the email token
router.get('/verify/:token', async (req, res) => {
    try {
        const user = await User.findOne({ verificationToken: req.params.token });
        if (!user) {
            return res.status(400).json({ msg: 'Token inválido ou expirado.' });
        }

        user.isVerified = true;
        user.verificationToken = undefined;
        await user.save();
        res.json({ msg: 'Email verificado com sucesso! Você já pode fazer login.' });
    } catch (err) {
        res.status(500).json({ msg: 'Erro ao verificar email.' });
    }
});

// Request Password Reset
router.post('/forgot-password', async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) return res.status(404).json({ msg: 'Nenhum usuário encontrado com esse email.' });

        const resetToken = crypto.randomBytes(32).toString('hex');
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpire = Date.now() + 3600000; // 1 Hora

        await user.save();

        try {
            await sendPasswordResetEmail(user.email, resetToken);
            res.json({ msg: 'Email de recuperação enviado!' });
        } catch (err) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
            await user.save();
            res.status(500).json({ msg: 'Erro ao enviar email.' });
        }
    } catch (err) {
        res.status(500).json({ msg: 'Erro no servidor' });
    }
});

// Reset the actual password
router.post('/reset-password/:token', async (req, res) => {
    try {
        const user = await User.findOne({
            resetPasswordToken: req.params.token,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) return res.status(400).json({ msg: 'Token inválido ou expirado.' });

        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save();
        res.json({ msg: 'Sua senha foi redefinida com sucesso!' });
    } catch (err) {
        res.status(500).json({ msg: 'Erro ao redefinir a senha' });
    }
});

export default router;
