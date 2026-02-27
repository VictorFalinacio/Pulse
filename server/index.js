import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/auth.js';
import analysisRoutes from './routes/analysis.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(helmet());

const corsOptions = {
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));

const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Muitas requisições deste IP, tente novamente mais tarde.'
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: 'Muitas tentativas de autenticação, tente novamente em 15 minutos.'
});

app.use(generalLimiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

if (process.env.NODE_ENV === 'development') {
    app.use((req, res, next) => {
        if (!req.path.includes('password') && !req.path.includes('token')) {
            console.log(`${req.method} ${req.path}`);
        }
        next();
    });
}

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
    console.warn('⚠️  MONGO_URI is not defined in environment variables');
    console.warn('Database operations will not work. Run "npm run server" with proper .env configuration.');
}

let mongoConnected = false;

const ensureMongoConnection = async () => {
    if (!mongoConnected && MONGO_URI) {
        try {
            await mongoose.connect(MONGO_URI);
            mongoConnected = true;
            console.log('✅ Connected to MongoDB');
            return true;
        } catch (err) {
            console.error('❌ MongoDB connection error:', err.message);
            return false;
        }
    }
    return mongoConnected;
};

if (MONGO_URI) {
    ensureMongoConnection().catch(err => {
        console.error('Initial MongoDB connection failed:', err);
    });
}

app.use('/api/', async (req, res, next) => {
    console.log(`[MIDDLEWARE] Processing ${req.method} ${req.path}`);
    
    const connected = await ensureMongoConnection();
    if (!connected && MONGO_URI) {
        console.warn(`[MIDDLEWARE] MongoDB not connected for ${req.path}`);
    }
    next();
});

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/analysis', analysisRoutes);

app.get('/api/health', (req, res) => {
    res.json({ 
        message: 'Server is running',
        mongoConnected: mongoConnected,
        hasMongoUri: !!MONGO_URI,
        mongoReadyState: mongoose.connection?.readyState
    });
});

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}

export default app;
