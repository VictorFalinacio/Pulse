import * as authService from '../services/authService.js';

export const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        await authService.registerUser(name, email, password);
        res.json({ msg: 'Conta criada! Verifique seu email para ativá-la.' });
    } catch (error) {
        if (error.message === 'EMAIL_INVALID') return res.status(400).json({ msg: 'Email inválido.' });
        if (error.message.startsWith('PASSWORD_WEAK:')) return res.status(400).json({ msg: error.message.split(':')[1] });
        if (error.message === 'NAME_INVALID') return res.status(400).json({ msg: 'Nome deve ter pelo menos 2 caracteres.' });
        if (error.message === 'USER_EXISTS') return res.status(400).json({ msg: 'Este email já está cadastrado.' });
        if (error.message === 'EMAIL_SEND_ERROR') return res.status(500).json({ msg: 'Erro ao enviar email de verificação.' });
        
        console.error(error);
        res.status(500).json({ msg: 'Erro Interno do Servidor' });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const result = await authService.loginUser(email, password);
        res.json(result);
    } catch (error) {
        if (error.message === 'MISSING_CREDENTIALS') return res.status(400).json({ msg: 'Email e senha são obrigatórios.' });
        if (error.message === 'INVALID_CREDENTIALS') return res.status(400).json({ msg: 'Email ou senha inválidos.' });
        if (error.message === 'UNVERIFIED') return res.status(403).json({ msg: 'Sua conta não foi verificada. Cheque seu email.' });
        
        console.error(error);
        res.status(500).json({ msg: 'Erro Interno do Servidor' });
    }
};

export const verifyEmail = async (req, res) => {
    try {
        await authService.verifyEmail(req.body.token);
        res.json({ msg: 'Email verificado com sucesso! Você já pode fazer login.' });
    } catch (error) {
        if (error.message === 'MISSING_TOKEN') return res.status(400).json({ msg: 'Token é obrigatório.' });
        if (error.message === 'INVALID_TOKEN') return res.status(400).json({ msg: 'Token inválido ou expirado.' });
        
        console.error(error);
        res.status(500).json({ msg: 'Erro ao verificar email.' });
    }
};

export const requestPasswordReset = async (req, res) => {
    try {
        await authService.requestPasswordReset(req.body.email);
        res.json({ msg: 'Se o email existe, você receberá um link de recuperação (ou já foi enviado).' }); // Better unified msg
    } catch (error) {
        if (error.message === 'EMAIL_INVALID') return res.status(400).json({ msg: 'Email inválido.' });
        if (error.message === 'EMAIL_SEND_ERROR') return res.status(500).json({ msg: 'Erro ao enviar email.' });
        
        console.error(error);
        res.status(500).json({ msg: 'Erro no servidor' });
    }
};

export const verifyResetToken = async (req, res) => {
    try {
        await authService.verifyResetToken(req.body.token);
        res.json({ msg: 'Token válido.' });
    } catch (error) {
        if (error.message === 'MISSING_TOKEN') return res.status(400).json({ msg: 'Token é obrigatório.' });
        if (error.message === 'INVALID_TOKEN') return res.status(400).json({ msg: 'Token inválido ou expirado.' });
        
        res.status(500).json({ msg: 'Erro ao verificar token.' });
    }
};

export const resetPassword = async (req, res) => {
    try {
        const { token, password } = req.body;
        await authService.resetPassword(token, password);
        res.json({ msg: 'Sua senha foi redefinida com sucesso!' });
    } catch (error) {
        if (error.message === 'MISSING_CREDENTIALS') return res.status(400).json({ msg: 'Token e senha são obrigatórios.' });
        if (error.message.startsWith('PASSWORD_WEAK:')) return res.status(400).json({ msg: error.message.split(':')[1] });
        if (error.message === 'INVALID_TOKEN') return res.status(400).json({ msg: 'Token inválido ou expirado.' });
        
        console.error(error);
        res.status(500).json({ msg: 'Erro ao redefinir a senha' });
    }
};
