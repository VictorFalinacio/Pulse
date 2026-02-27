# Agile Pulse: Análise Inteligente de Cerimônias Ágeis

## 📋 Propósito

**Agile Pulse** é uma plataforma que transforma atas de reuniões ágeis (Dailies, Reviews, Plannings) em relatórios estruturados e acionáveis usando Inteligência Artificial.

A missão é **eliminar overhead administrativo** de Product Owners e Scrum Masters, automatizando a extração de:
-  Impedimentos e blockers
-  Ações a serem tomadas
-  Riscos potenciais para a entrega

Ao invés de ler longas atas manualmente, gerentes obtêm em segundos um diagnóstico profissional estruturado.

---

##  Arquitetura & Como Foi Feito

### Stack Tecnológico

```
Frontend:
├── React 19.2 + TypeScript
├── Vite (build tool)
├── React Router (navegação)
├── TailwindCSS (estilos)
└── Lucide React (ícones)

Backend:
├── Node.js + Express 5.2
├── MongoDB 9 (banco de dados)
├── Mongoose (ODM)
├── Google Gemini 2.5 Flash (IA)
└── Nodemailer (email)

Deployment:
├── Frontend: Vercel
├── Backend: Vercel Serverless Functions
└── Database: MongoDB Atlas
```

