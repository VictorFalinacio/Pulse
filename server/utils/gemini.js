import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const genAI1 = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const genAI2 = new GoogleGenerativeAI(process.env.GEMINI_API_KEY_2 || process.env.GEMINI_API_KEY);

const DEFAULT_MODEL = "models/gemini-1.5-flash";

export const analyzeText = async (text) => {
    const prompt = `Aja como um Product Owner sênior especialista em metodologias ágeis. Analise o texto fornecido (que pode ser uma Daily, Review ou Planning) e gere um relatório rigorosamente estruturado seguindo este modelo:

# Relatório de Análise - [Nome da Squad ou Projeto]
**Data:** [Data da Análise] | **Squad:** [Nome da Squad ou "Padrão"] | **Evento Avaliado:** [Tipo de Evento Inferido]

---

### Resumo Executivo
[Um texto conciso e profissional descrevendo os principais pontos de progresso e a situação atual do time.]

---

### Identificação de Impedimentos (Blockers)
**[Nome da Pessoa/Área] - [Título do Problema]:**
- **Problema:** [Descrição detalhada do bloqueio]
- **Sub-impedimento:** [Se houver]
- **Impacto:** [Qual o risco real para a entrega]

---

### Próximos Passos (Action Items)
**[Nome da Pessoa/Papel]:**
- **Ação:** [Tarefa clara]
- Nunca se coloque como responsável, você é somente um analista.
- **Responsável:** [Nome ou Papel]

(IMPORTANTE: Pule duas linhas entre cada pessoa/papel diferente para não misturar os nomes)

---

### Análise de Riscos
- **Risco de [Categoria] ([Nível: Alta/Média/Baixa]):** [Descrição do risco e justificativa baseada no texto].

Certifique-se de manter um tom profissional, corporativo e focado em resultados. NUNCA misture o nome de uma pessoa com o 'Responsável' da tarefa anterior. Use negrito nos cabeçalhos de nomes.

Texto para análise:
${text}`;

    try {
        const model = genAI2.getGenerativeModel({ model: DEFAULT_MODEL });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error('Gemini Analysis Error (Attempt 1):', error.message);
        
        // Se falhou com a chave 2, tenta com a chave 1 como backup
        try {
            console.log('Falling back to Key 1...');
            const model = genAI1.getGenerativeModel({ model: DEFAULT_MODEL });
            const result = await model.generateContent(prompt);
            const response = await result.response;
            return response.text();
        } catch (fallbackError) {
            console.error('Gemini Fallback Error:', fallbackError.message);
            throw new Error(fallbackError.message || 'Falha ao analisar o texto com IA.');
        }
    }
};

export const analyzeSprintContext = async (allTexts) => {
    const prompt = ` Aja como um Product Owner sênior especialista em metodologias ágeis. Você recebeu uma lista de transcrições/notas de várias reuniões (Dailies) de uma mesma Sprint. Sua tarefa é consolidar todas essa informações em um único Resumo de Sprint atualizado.

Identifique padrões, progresso acumulado ao longo dos dias e impedimentos recorrentes. Gere somente o relatório, sem introduções ou despedidas. Gere um relatório rigorosamente estruturado: 

# Resumo Consolidado da Sprint - [Contexto do resumo até o momento]
**Estado Atual:** [Progresso Geral: ex: andamento dentro do esperado] | **Total de Reuniões Analisadas:** [Número de textos] SEMPRE INCLUIR A QUANTIDADE DE REUNIÕES REALIZADAS E A DATA CASO O ARQUIVO POSSUA

---

### Visão Geral do Progresso (Sprint Health)
[Um resumo executivo que sintetiza a evolução do time desde o primeiro dia até o último upload. Destaque se a sprint está saudável ou em risco.]

---

### Bloqueios e Impedimentos Identificados
(Liste os bloqueios mencionados, indicando se algum persiste por vários dias)
**[Nome da Pessoa/Área] - [Título]:**
- **Status:** [Ativo / Resolvido]
- **Impacto Acumulado:** [Como isso atrasou a sprint]

---

### Principais Entregas e Conquistas
- [Lista de itens que foram concluídos ou avançaram significativamente]

---

### Plano de Ação Próximos Passos
**[Responsável]:**
- **Ação Prioritária:** [O que deve ser feito imediatamente para garantir a entrega da sprint]

---

### Alertas de Risco Atualizados
- **[Categoria]:** [Descrição do risco baseado no histórico de todos os dias analisados]

Textos das reuniões da sprint (em ordem cronológica):
${allTexts.join('\n\n--- NOVA REUNIÃO ---\n\n')}`;

    try {
        const model = genAI2.getGenerativeModel({ model: DEFAULT_MODEL });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error('Gemini Sprint Analysis Fallback Attempt...');
        try {
            const model = genAI1.getGenerativeModel({ model: DEFAULT_MODEL });
            const result = await model.generateContent(prompt);
            const response = await result.response;
            return response.text();
        } catch (fallbackError) {
            throw new Error(fallbackError.message || 'Falha ao analisar o contexto da sprint com IA.');
        }
    }
};
