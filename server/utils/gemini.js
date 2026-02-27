import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const analyzeText = async (text) => {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

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

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error('Gemini Analysis Error:', error);
        throw new Error('Falha ao analisar o texto com IA.');
    }
};
