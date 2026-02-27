import jwt from 'jsonwebtoken';

const authMiddleware = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({ msg: 'Acesso negado. Token não fornecido.' });
    }

    // Ensure JWT_SECRET is defined
    if (!process.env.JWT_SECRET) {
        console.error('CRITICAL: JWT_SECRET is not defined in environment variables');
        return res.status(500).json({ msg: 'Erro interno do servidor - configuração faltando.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded.user;
        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ msg: 'Token expirado. Faça login novamente.' });
        }
        res.status(401).json({ msg: 'Token inválido.' });
    }
};

export default authMiddleware;
