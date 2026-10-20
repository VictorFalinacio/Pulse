import * as sprintService from '../services/sprintService.js';
import { validateFileMagicBytes } from '../utils/uploadValidation.js';

export const createSprint = async (req, res) => {
    try {
        const { name, durationDays } = req.body;

        if (typeof name !== 'string' || !name.trim() || !Number.isInteger(Number(durationDays)) || Number(durationDays) < 1) {
            return res.status(400).json({ msg: 'Nome e duração são obrigatórios.' });
        }

        if (Number(durationDays) > 14) {
            return res.status(400).json({ msg: 'A duração máxima é de 14 dias.' });
        }

        const sprintCount = await sprintService.countUserSprints(req.user.id);
        if (sprintCount >= 5) {
            return res.status(400).json({ msg: 'O limite máximo de 5 sprints foi atingido.' });
        }

        const newSprint = await sprintService.createSprint(req.user.id, name.trim(), Number(durationDays));
        res.json(newSprint);
    } catch (error) {
        res.status(500).json({ msg: 'Erro ao criar sprint.' });
    }
};

export const getSprints = async (req, res) => {
    try {
        const sprints = await sprintService.getSprintsByUser(req.user.id);
        res.json(sprints);
    } catch (error) {
        res.status(500).json({ msg: 'Erro ao buscar sprints.' });
    }
};

export const getSprintById = async (req, res) => {
    try {
        const sprint = await sprintService.getSprintById(req.params.id, req.user.id);
        res.json(sprint);
    } catch (error) {
        if (error.message === 'NOT_FOUND') return res.status(404).json({ msg: 'Sprint não encontrada.' });
        if (error.message === 'UNAUTHORIZED') return res.status(401).json({ msg: 'Não autorizado.' });
        res.status(500).json({ msg: 'Erro ao buscar sprint.' });
    }
};

export const updateExpectedResult = async (req, res) => {
    try {
        const { expectedResult } = req.body;
        if (typeof expectedResult !== 'string' || expectedResult.length > 2000) {
            return res.status(400).json({ msg: 'Resultado esperado deve ser um texto de até 2.000 caracteres.' });
        }
        const sprint = await sprintService.updateExpectedResult(req.params.id, req.user.id, expectedResult);
        res.json(sprint);
    } catch (error) {
        if (error.message === 'NOT_FOUND') return res.status(404).json({ msg: 'Sprint não encontrada.' });
        if (error.message === 'UNAUTHORIZED') return res.status(401).json({ msg: 'Não autorizado.' });
        res.status(500).json({ msg: 'Erro ao atualizar resultado esperado.' });
    }
};

export const uploadSprintData = async (req, res) => {
    try {
        const { id, day } = req.params;

        if (!req.file) {
            return res.status(400).json({ msg: 'Por favor, envie um arquivo.' });
        }

        const { originalname, mimetype, buffer } = req.file;

        if (!validateFileMagicBytes(buffer, mimetype)) {
            return res.status(400).json({ msg: 'Arquivo inválido ou corrompido.' });
        }

        const result = await sprintService.processSprintUpload(req.user.id, id, day, buffer, mimetype, originalname);
        
        res.json(result);

    } catch (error) {
        console.error('Sprint Upload Error:', error);
        
        if (error.message === 'NOT_FOUND') return res.status(404).json({ msg: 'Sprint não encontrada.' });
        if (error.message === 'UNAUTHORIZED') return res.status(401).json({ msg: 'Não autorizado.' });
        if (error.message === 'BAD_REQUEST_DAY') return res.status(400).json({ msg: 'Dia inválido para esta sprint.' });
        if (error.message === 'BAD_REQUEST_EMPTY') return res.status(400).json({ msg: 'Não foi possível extrair texto do arquivo.' });
        if (error.message === 'AI_INPUT_TOO_LARGE') return res.status(413).json({ msg: 'O texto acumulado ultrapassa o limite de contexto configurado.' });
        if (error.message === 'AI_TIMEOUT') return res.status(504).json({ msg: 'A análise levou muito tempo. Tente novamente com um arquivo menor.' });
        if (error.message.startsWith('Falha ao analisar')) return res.status(502).json({ msg: 'A análise por IA falhou. Tente novamente em instantes.' });
        
        res.status(500).json({ msg: 'Erro ao processar o upload da sprint.' });
    }
};

export const deleteSprint = async (req, res) => {
    try {
        await sprintService.deleteSprint(req.params.id, req.user.id);
        res.json({ msg: 'Sprint excluída com sucesso.' });
    } catch (error) {
        if (error.message === 'NOT_FOUND') return res.status(404).json({ msg: 'Sprint não encontrada.' });
        if (error.message === 'UNAUTHORIZED') return res.status(401).json({ msg: 'Não autorizado.' });
        res.status(500).json({ msg: 'Erro ao excluir sprint.' });
    }
};
