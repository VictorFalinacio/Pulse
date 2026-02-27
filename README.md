# Agile Pulse: Dashboard de Governança Ágil com IA

O **Agile Pulse** é uma plataforma Full Stack desenvolvida para monitorar dados on-sprint de squads em tempo real. Servindo como uma ferramenta de apoio para **Product Owners** e **Scrum Masters**, o projeto integra Inteligência Artificial para processar documentos de cerimônias ágeis (Dailies, Reviews, Plannings) e extrair insights estratégicos automaticamente.

Diferente de dashboards convencionais, o Agile Pulse atua como um **assistente técnico**. Ele utiliza a experiência de Líder de Cerimônias Ágeis para instruir a IA a pensar como um gestor, focando em riscos e dependências técnicas.

---

## Funcionalidades Principais

* **Monitorização em Tempo Real:** Visualização de dados e métricas de desempenho de squads durante a sprint.
* **Análise de Documentos via IA:** Upload de arquivos (PDF/TXT) com processamento via **API do Gemini** para identificação automática de impedimentos (*blockers*) e próximos passos.
* **Gestão de Governança:** Transformação de relatos de reuniões em relatórios estruturados, focando na redução de ruídos de comunicação e aumento do ROI.
* **Autenticação Segura:** Sistema completo de cadastro e login com validação de utilizadores e proteção de rotas.

---

## Tecnologias Utilizadas

| Camada | Tecnologia |
| :--- | :--- |
| **Frontend** | React.js com deploy na Vercel |
| **Backend** | Node.js com arquitetura escalável |
| **Banco de Dados** | MongoDB para persistência de dados e histórico de análises |
| **IA Engine** | Google Gemini API para processamento de linguagem natural (NLP) |

---

## Diferencial Estratégico

O sistema foi desenhado para ir além do resumo de texto. O motor de IA analisa o contexto técnico e comportamental das cerimônias para alertar sobre gargalos que podem comprometer a entrega da Sprint. Ao cruzar os relatos das Dailies com as metas estabelecidas, o Agile Pulse fornece uma camada de inteligência preditiva para a gestão ágil.
