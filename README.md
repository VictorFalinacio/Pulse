# Agile Pulse: Dashboard de Governança Ágil com IA

O **Agile Pulse** é uma plataforma Full Stack desenvolvida para monitorar dados on-sprint de squads em tempo real. Servindo como uma ferramenta de apoio para **Product Owners** e **Scrum Masters**, o projeto integra Inteligência Artificial para processar documentos de cerimônias ágeis (Dailies, Reviews, Plannings) e extrair insights estratégicos automaticamente.

Diferente de dashboards convencionais, o Agile Pulse atua como um **assistente técnico**. Ele utiliza a experiência de Líder de Cerimônias Ágeis para instruir a IA a pensar como um gestor, focando em riscos e dependências técnicas.

---

## 🚀 Quick Start

### Desenvolvimento Local

```bash
# 1. Clone o repositório
git clone https://github.com/seu-usuario/pulse.git
cd pulse

# 2. Instale as dependências
npm install

# 3. Configure variáveis de ambiente
cp .env.local.example .env.local
# Edite .env.local com seus valores reais

# 4. Inicie frontend (em um terminal)
npm run dev

# 5. Inicie backend (em outro terminal)
npm run server

# Frontend: http://localhost:5173
# Backend: http://localhost:5000
```

### Deploy na Vercel

Veja [DEPLOYMENT.md](./DEPLOYMENT.md) para instruções passo a passo.

```bash
# 1 minuto: Deploy automático via Vercel CLI
vercel --prod
```

---

## Funcionalidades Principais

* **Monitorização em Tempo Real:** Visualização de dados e métricas de desempenho de squads durante a sprint.
* **Análise de Documentos via IA:** Upload de arquivos (PDF/DOCX/TXT) com processamento via **API do Gemini** para identificação automática de impedimentos (*blockers*) e próximos passos.
* **Gestão de Governança:** Transformação de relatos de reuniões em relatórios estruturados, focando na redução de ruídos de comunicação.
* **Autenticação Segura:** Sistema completo de cadastro, login e recuperação de senha com validação forte e proteção OWASP.
* **Rate Limiting:** Proteção contra força bruta e abuso de API.
* **Análise de Força de Senha:** Indicador visual em tempo real com requisitos de segurança rigorosos.

---

## Tecnologias Utilizadas

| Camada | Tecnologia |
| :--- | :--- |
| **Frontend** | React 19 + TypeScript + Vite |
| **Backend** | Node.js + Express.js |
| **Banco de Dados** | MongoDB Atlas |
| **Autenticação** | JWT com 30 min expiration |
| **IA Engine** | Google Gemini API 2.5 Flash |
| **Segurança** | Helmet.js, Rate Limiting, bcrypt |
| **Email** | Gmail SMTP + Nodemailer |
| **Deployment** | Vercel (Frontend + Backend) |

---

## 🔐 Segurança Implementada (Nível Corporativo)

✅ **Autenticação & Autorização**
- JWT com expiração curta (30 minutos)
- Tokens de verificação com TTL de 24 horas
- Reset de senha com token de 1 hora

✅ **Proteção de Dados**
- Validação de força de senha (12+ chars, maiúsculas, números, símbolos)
- Bcrypt com salt 10 para hashing
- Rate limiting: 5 tentativas por 15 min em login

✅ **Headers de Segurança**
- Helmet.js para CSP, X-Frame-Options, HSTS
- CORS configurado com whitelist de origens
- Sem console.logs sensíveis em produção

✅ **Validação de Entrada**
- Email validation com biblioteca validator
- Validação de magic bytes em uploads
- Limite de 5MB por arquivo
- Timeout 30s para processamento da IA

---

## 📋 Estrutura do Projeto

```
pulse/
├── src/                           # Frontend React
│   ├── pages/                     # Páginas (Login, Register, Dashboard)
│   ├── components/               # Componentes reutilizáveis
│   ├── utils/                    # Utilitários (validação, config)
│   └── App.tsx                   # Componente raiz
├── server/                        # Backend Node.js
│   ├── routes/                   # Rotas (auth, analysis)
│   ├── models/                   # Schemas MongoDB (User, Analysis)
│   ├── utils/                    # Utilitários (mailer, Gemini, validação)
│   └── index.js                  # Server Express
├── api/                          # Vercel Serverless Functions
│   └── index.js                  # Entry point para Vercel
├── vercel.json                   # Configuração Vercel
├── vite.config.ts                # Configuração Vite
├── tsconfig.json                 # Configuração TypeScript
└── DEPLOYMENT.md                 # Guia de deployment

```

---

## 🔑 Variáveis de Ambiente Necessárias

### Desenvolvimento Local (.env.local)
```env
JWT_SECRET=seu_secret_desenvolvimento
MONGO_URI=mongodb+srv://...
EMAIL_USER=seu_email@gmail.com
EMAIL_PASS=sua_app_password
GEMINI_API_KEY=sua_chave_gemini
FRONTEND_URL=http://localhost:5173
ALLOWED_ORIGINS=http://localhost:5173
NODE_ENV=development
```

### Produção Vercel (.env)
```env
JWT_SECRET=secret_aleatorio_32_chars (use: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
MONGO_URI=mongodb+srv://...
EMAIL_USER=seu_email@gmail.com
EMAIL_PASS=sua_app_password
GEMINI_API_KEY=sua_chave_gemini
FRONTEND_URL=https://seu-projeto.vercel.app
ALLOWED_ORIGINS=https://seu-projeto.vercel.app,https://seu-dominio.com
NODE_ENV=production
```

---

## 🛠️ Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev          # Inicia frontend em http://localhost:5173
npm run server       # Inicia backend em http://localhost:5000

# Build & Production
npm run build        # Compila TypeScript e Vite (para Vercel)
npm run preview      # Preview da build de produção

# Qualidade de Código
npm run lint         # ESLint em todos os arquivos
```

---

## 📈 Diferencial Estratégico

O sistema foi desenhado para ir além do resumo de texto. O motor de IA analisa o contexto técnico e comportamental das cerimônias para alertar sobre gargalos que podem comprometer a entrega da Sprint. Ao cruzar os relatos das Dailies com as metas estabelecidas, o Agile Pulse fornece uma camada de inteligência preditiva para a gestão ágil.

---

## 🚨 Antes de Subir para Produção

- [ ] Variáveis de ambiente configuradas na Vercel
- [ ] MongoDB Atlas com whitelist de IPs (0.0.0.0/0)
- [ ] Gmail com App Password configurado
- [ ] Gemini API Key ativa
- [ ] JWT_SECRET gerado aleatoriamente (32+ chars)
- [ ] ALLOWED_ORIGINS específico (não *)
- [ ] Domínio custom (opcional)
- [ ] SSL/HTTPS habilitado (automático na Vercel)

---

## 📞 Suporte & Documentação

- **Desenvolvimento**: [Setup Local](#quick-start)
- **Deployment**: [DEPLOYMENT.md](./DEPLOYMENT.md)
- **API Reference**: Ver documentação em `server/routes/`
- **Vercel Docs**: https://vercel.com/docs
- **MongoDB Atlas**: https://docs.mongodb.com/

---

## 📄 Licença

MIT - Veja [LICENSE](./LICENSE) para detalhes.

---

**Versão:** 1.0.0  
**Última atualização:** 27 de Fevereiro de 2026  
**Status:** ✅ Pronto para Produção
