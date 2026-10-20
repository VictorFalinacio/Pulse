# Agile Pulse

Plataforma para transformar atas de cerimônias ágeis em relatórios sobre progresso, impedimentos, ações e riscos usando IA.

## Como funciona

- O usuário cria uma conta, confirma o e-mail e entra com senha.
- No dashboard, pode enviar uma ata individual ou criar uma sprint de até 14 dias e anexar uma reunião a cada dia.
- A API extrai texto de PDF, DOCX ou TXT, envia o texto ao Google Gemini e persiste o relatório e os dados no MongoDB.
- As atas de uma sprint são consolidadas em um relatório atualizado a cada upload.

## Arquitetura

- Frontend: React 19, TypeScript, Vite e React Router.
- API: Node.js, Express 5, controllers/services, autenticação JWT.
- Dados: MongoDB e Mongoose.
- Integrações: Gemini para relatórios; Nodemailer/Gmail SMTP para e-mail.
- Deploy: frontend estático e API serverless na Vercel.

`server/app.js` concentra middleware, rotas, conexão MongoDB, logs e erros. `server/index.js` inicia o servidor local; `api/index.js` exporta a mesma aplicação para a Vercel.

## Rodar localmente

Requisitos: Node.js 20 ou superior, npm e MongoDB local ou Atlas.

```bash
npm install
npm run dev
```

Em outro terminal, inicie a API:

```bash
npm run server
```

Copie `.env.example` para `.env` na raiz e preencha os valores reais. `.env` é ignorado pelo Git e não deve ser commitado:

```dotenv
MONGO_URI=mongodb://127.0.0.1:27017/agile-pulse
JWT_SECRET=gere-um-segredo-longo-e-aleatorio
EMAIL_USER=seu-email-de-envio@gmail.com
EMAIL_PASS=senha-de-aplicativo-do-provedor
GEMINI_API_KEY=sua-chave-do-gemini
GEMINI_API_KEY_2=
GEMINI_MODEL=gemini-2.5-flash
GEMINI_MAX_INPUT_CHARS=50000
GEMINI_MAX_SPRINT_CONTEXT_CHARS=50000
GEMINI_MAX_OUTPUT_TOKENS=4096
GEMINI_TIMEOUT_MS=25000
ALLOWED_ORIGINS=http://localhost:5173
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
PORT=5000
```

`npm run build` gera `dist`; `npm run preview` serve o build. Configure as mesmas variáveis necessárias no provedor de deploy. Segredos ficam somente no backend.

## API

Rotas autenticadas esperam `Authorization: Bearer <JWT>`. Corpos e respostas são JSON, exceto uploads, que usam `multipart/form-data` com o campo `file`.

| Método | Rota | Acesso | Descrição |
|---|---|---|---|
| POST | `/api/auth/register` | Público | Cria conta. JSON: `name`, `email`, `password`. |
| POST | `/api/auth/login` | Público | Valida credenciais e devolve JWT e usuário. |
| POST | `/api/auth/verify-email` | Público | Confirma e-mail. JSON: `token`. |
| POST | `/api/auth/forgot-password` | Público | Solicita link de redefinição. JSON: `email`. |
| POST | `/api/auth/verify-reset-token` | Público | Valida token de redefinição. JSON: `token`. |
| POST | `/api/auth/reset-password` | Público | Altera senha. JSON: `token`, `password`. |
| POST | `/api/analysis/analisar` | Autenticado | Analisa PDF, DOCX ou TXT de até 5 MB. |
| GET | `/api/analysis/cooldown` | Autenticado | Informa cooldown de upload. |
| GET | `/api/analysis/historico` | Autenticado | Lista análises avulsas do usuário. |
| DELETE | `/api/analysis/:id` | Autenticado | Exclui análise própria. |
| POST | `/api/sprint` | Autenticado | Cria sprint com `name` e `durationDays` de 1 a 14. |
| GET | `/api/sprint` | Autenticado | Lista sprints do usuário. |
| GET | `/api/sprint/:id` | Autenticado | Busca sprint e uploads. |
| PUT | `/api/sprint/:id/expected` | Autenticado | Atualiza `expectedResult` (até 2.000 caracteres). |
| DELETE | `/api/sprint/:id` | Autenticado | Exclui sprint e suas análises associadas. |
| POST | `/api/sprint/:id/upload/:day` | Autenticado | Analisa ou substitui a reunião do dia. |
| GET | `/api/health` | Público | Retorna estado da API e do MongoDB; usa HTTP 503 se o banco estiver indisponível. |

## Limites, segurança e operação

- Os arquivos ficam em memória durante o processamento. O arquivo original não é armazenado; o texto extraído e o relatório são persistidos no MongoDB.
- Limites: 100 requisições gerais por IP a cada 15 minutos; 5 requisições de autenticação por IP a cada 15 minutos; um upload por usuário a cada minuto; arquivo de até 5 MB.
- O backend emite logs JSON com horário, rota, método, status e duração. Não registra corpo, senhas, tokens ou conteúdo de atas.
- O texto enviado ao Gemini é limitado por `GEMINI_MAX_INPUT_CHARS`; o contexto consolidado de sprint é limitado por `GEMINI_MAX_SPRINT_CONTEXT_CHARS`. `GEMINI_MAX_OUTPUT_TOKENS` controla o tamanho máximo da resposta e `GEMINI_TIMEOUT_MS` controla o tempo de espera. Os limites têm tetos de segurança no servidor.
- A aplicação não consulta métricas de cobrança por token. Configure limites e alertas de orçamento no console do provedor Gemini. O uso da chave é configurável por `GEMINI_MODEL`; `GEMINI_API_KEY_2` funciona como alternativa a `GEMINI_API_KEY`.
- O backend verifica propriedade dos recursos, hash de senha, tokens com expiração, origem CORS, tipo/assinatura de arquivos e limites de requisições.
- Em produção, use HTTPS, segredo JWT aleatório, chaves restritas e uma lista `ALLOWED_ORIGINS` com apenas domínios publicados.

## Comandos

| Comando | Ação |
|---|---|
| `npm run dev` | Inicia Vite. |
| `npm run server` | Inicia API local na porta 5000 por padrão. |
| `npm run build` | Executa verificação TypeScript e build de produção. |
| `npm run lint` | Executa ESLint. |
| `npm run preview` | Serve o build local. |
| `npm test` | Executa testes unitários com o runner integrado ao Node.js. |
