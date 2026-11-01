# Agile Pulse

Plataforma para transformar atas de cerimônias ágeis em relatórios sobre progresso, impedimentos, ações e riscos usando IA.

## Como funciona

- O usuário cria uma conta, confirma o e-mail e entra com senha.
- No dashboard, pode enviar uma ata individual ou criar uma sprint de até 14 dias e anexar uma reunião a cada dia.
- A API extrai texto de PDF, DOCX ou TXT, envia o texto ao Groq e persiste o relatório e os dados no MongoDB.
- As atas de uma sprint são consolidadas em um relatório atualizado a cada upload.

## Arquitetura

- Frontend: React 19, TypeScript, Vite e React Router.
- API: Node.js, Express 5, controllers/services, autenticação JWT.
- Dados: MongoDB e Mongoose.
- Integrações: Groq para relatórios; Nodemailer/Gmail SMTP para e-mail.
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
GROQ_API_KEY=sua-chave-do-groq
GROQ_MODEL=openai/gpt-oss-120b
AI_MAX_INPUT_CHARS=50000
AI_MAX_SPRINT_CONTEXT_CHARS=50000
AI_MAX_OUTPUT_TOKENS=8192
AI_TIMEOUT_MS=22000
AI_REASONING_EFFORT=medium
TRUST_PROXY_HOPS=0
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
- Em Vercel, `trust proxy` usa um salto por padrão (`VERCEL`), pois a plataforma sobrescreve `X-Forwarded-For` com o IP público do cliente. `TRUST_PROXY_HOPS` permite ajustar de 0 a 5; localmente o padrão é 0. Para validar em preview antes de produção, adicione temporariamente um log de `req.ip` e `req.get('x-forwarded-for')`, compare acessos por redes diferentes e tente enviar um `X-Forwarded-For` falso; confirme que o IP identificado permanece o IP público. Remova o log de diagnóstico após validar.
- Os limiters expressos usam memória local por instância e não formam um contador global confiável entre funções serverless. O cooldown de upload é conferido no MongoDB para uploads avulsos e de sprint, valendo entre instâncias depois que uma análise é salva. Um store distribuído para os outros limites não foi adicionado.
- Uploads de sprint substituem/adicionam o dia com operações atômicas e filtro de proprietário; uma análise criada é removida se a atualização da sprint falhar. Em uploads concorrentes de dias diferentes, todos os dias ficam salvos, mas o resumo consolidado ainda pode refletir um snapshot antigo: o último resumo a gravar vence.
- O backend emite logs JSON com horário, rota, método, status e duração. Não registra corpo, senhas, tokens ou conteúdo de atas.
- Campos de autenticação são validados como texto antes de consultar o banco. E-mails novos e atualizados são removidos de espaços externos e normalizados para minúsculas. A alteração do schema não reescreve automaticamente os e-mails já armazenados; antes de aplicar em uma base existente, normalize-os após backup e resolva eventuais duplicatas sem diferenciar maiúsculas/minúsculas. Contas antigas com caixa mista podem não conseguir entrar até essa migração.
- Tokens de verificação e redefinição são persistidos somente como SHA-256. Tokens pendentes já emitidos em texto puro deixam de funcionar após a atualização; os usuários afetados devem solicitar novos links. O limite estrito de autenticação é de 5 tentativas por 15 minutos; verificações de e-mail e de token usam um limite separado de 30 por 15 minutos.
- O texto enviado ao Groq é limitado por `AI_MAX_INPUT_CHARS`; o contexto consolidado de sprint é limitado por `AI_MAX_SPRINT_CONTEXT_CHARS`. `AI_MAX_OUTPUT_TOKENS` controla o limite de conclusão (incluindo raciocínio), `AI_REASONING_EFFORT` aceita `low`, `medium` ou `high`, e `AI_TIMEOUT_MS` define o prazo total de chamada e retries (máximo de 25s, abaixo dos 30s da função Vercel). Respostas terminadas por limite de tokens são rejeitadas e não são salvas. As variáveis antigas `GEMINI_MAX_*` e `GEMINI_TIMEOUT_MS` continuam aceitas como aliases depreciados para facilitar a migração; prefira as variáveis `AI_*`.
- A aplicação não consulta métricas de cobrança por token. Configure limites e alertas de orçamento no console do provedor Groq. O modelo pode ser configurado por `GROQ_MODEL`; a chave `GROQ_API_KEY` deve existir somente no backend.
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
| `npm run evals` | Consulta o Groq com atas sintéticas e verifica estrutura, placeholders, responsáveis e resistência a prompt injection. Sem `GROQ_API_KEY`, avisa e termina sem erro. |
