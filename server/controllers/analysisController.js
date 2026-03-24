import * as analysisService from '../services/analysisService.js';

const validateFileMagicBytes = (buffer, mimetype) => {
    const pdf = buffer.slice(0, 4).toString('hex').startsWith('25504446');
    const docx = buffer.slice(0, 4).equals(Buffer.from([0x50, 0x4b, 0x03, 0x04]));

    if (mimetype === 'application/pdf' && !pdf) return false;
    if (mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' && !docx) return false;
    
    return true;
};

export const analisar = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ msg: 'Por favor, envie um arquivo.' });
        }

        const { originalname, mimetype, buffer } = req.file;

        if (process.env.NODE_ENV === 'development') {
            console.log(`Processing file: ${originalname.substring(0, 20)}...`);
        }

        if (!validateFileMagicBytes(buffer, mimetype)) {
            return res.status(400).json({ msg: 'Arquivo inválido ou corrompido.' });
        }

        const analysis = await analysisService.processAnalysis(req.user.id, buffer, mimetype, originalname);
        res.json(analysis);

    } catch (error) {
        if (error.message === 'UNSUPPORTED_FORMAT') return res.status(400).json({ msg: 'Formato de arquivo não suportado. Use PDF, DOCX ou TXT.' });
        if (error.message === 'EMPTY_FILE') return res.status(400).json({ msg: 'Não foi possível extrair texto do arquivo (arquivo vazio ou sem texto).' });
        if (error.message === 'AI_TIMEOUT') return res.status(500).json({ msg: 'Análise levou muito tempo. Tente um arquivo menor.' });
        if (error.message.startsWith('AI_ERROR:')) return res.status(500).json({ msg: 'Erro na Inteligência Artificial: ' + error.message.split(':')[1] });

        if (process.env.NODE_ENV === 'development') {
            console.error('Analysis Route Error:', error.message);
        }
        res.status(500).json({ msg: 'Erro ao processar o arquivo.' });
    }
};

export const getCooldownStatus = async (req, res) => {
    try {
        const cooldown = await analysisService.checkCooldown(req.user.id);
        res.json(cooldown);
    } catch (error) {
        res.status(500).json({ msg: 'Erro ao verificar cooldown.' });
    }
};

export const getHistory = async (req, res) => {
    try {
        const history = await analysisService.getHistory(req.user.id);
        res.json(history);
    } catch (error) {
        res.status(500).json({ msg: 'Erro ao buscar histórico.' });
    }
};

export const deleteAnalysis = async (req, res) => {
    try {
        await analysisService.deleteAnalysis(req.params.id, req.user.id);
        res.json({ msg: 'Análise excluída com sucesso.' });
    } catch (error) {
        if (error.message === 'NOT_FOUND') return res.status(404).json({ msg: 'Análise não encontrada.' });
        if (error.message === 'UNAUTHORIZED') return res.status(401).json({ msg: 'Não autorizado para excluir esta análise.' });

        if (process.env.NODE_ENV === 'development') {
            console.error('Delete Analysis Error:', error);
        }
        res.status(500).json({ msg: 'Erro ao excluir a análise.' });
    }
};
