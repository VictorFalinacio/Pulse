import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/auth.js';
import analysisRoutes from './routes/analysis.js';
import sprintRoutes from './routes/sprint.js';
import { log } from './utils/logger.js';

const app = express();
let mongoConnectionPromise;
const mongoUri = process.env.MONGO_URI;

app.disable('x-powered-by');
app.use(helmet());
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',').map(value => value.trim()).filter(Boolean)
    || ['http://localhost:5173', 'http://localhost:3000'];
app.use(cors({
    origin(origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
        return callback(new Error('CORS_ORIGIN_DENIED'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: { msg: 'Muitas requisições deste IP, tente novamente mais tarde.' }
});
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: { msg: 'Muitas tentativas de autenticação, tente novamente em 15 minutos.' }
});

app.use((req, res, next) => {
    const startedAt = Date.now();
    res.on('finish', () => log('info', 'http_request', {
        method: req.method,
        path: req.path,
        status: res.statusCode,
        durationMs: Date.now() - startedAt
    }));
    next();
});
app.use(generalLimiter);
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ limit: '1mb', extended: true }));

const ensureMongoConnection = async () => {
    if (mongoose.connection.readyState === 1) return true;
    if (!mongoUri) return false;
    if (mongoose.connection.readyState === 0 && mongoConnectionPromise) mongoConnectionPromise = undefined;
    if (!mongoConnectionPromise) {
        mongoConnectionPromise = mongoose.connect(mongoUri)
            .then(() => true)
            .catch(error => {
                mongoConnectionPromise = undefined;
                log('error', 'mongodb_connection_failed', { message: error.message });
                return false;
            });
    }
    return mongoConnectionPromise;
};

app.use('/api/', async (req, res, next) => {
    if (req.path === '/health') return next();
    if (!await ensureMongoConnection()) {
        return res.status(503).json({ msg: 'Banco de dados temporariamente indisponível.' });
    }
    return next();
});

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/analysis', analysisRoutes);
app.use('/api/sprint', sprintRoutes);
app.get('/api/health', (_req, res) => {
    const databaseReady = mongoose.connection.readyState === 1;
    res.status(databaseReady ? 200 : 503).json({
        status: databaseReady ? 'ok' : 'degraded',
        database: databaseReady ? 'connected' : 'disconnected'
    });
});

app.use((req, res) => res.status(404).json({ msg: 'Rota não encontrada.' }));
app.use((error, req, res, _next) => {
    if (res.headersSent) return;
    const isUploadError = error?.name === 'MulterError' || error.message?.startsWith('Formato de arquivo não suportado');
    const status = isUploadError ? 400 : error.type === 'entity.too.large' ? 413
        : error.type === 'entity.parse.failed' ? 400 : error.message === 'CORS_ORIGIN_DENIED' ? 403 : 500;
    const message = isUploadError ? 'Arquivo inválido ou acima do limite permitido.'
        : error.type === 'entity.too.large' ? 'Corpo da requisição excede o limite permitido.'
        : error.type === 'entity.parse.failed' ? 'JSON inválido.'
        : error.message === 'CORS_ORIGIN_DENIED' ? 'Origem não permitida.'
        : 'Erro interno do servidor.';
    log(status >= 500 ? 'error' : 'warn', 'request_error', {
        method: req.method,
        path: req.path,
        status,
        message: error.message
    });
    res.status(status).json({ msg: message });
});

export default app;
