# INVIS Ecosystem - Pipeline de CI/CD e Deployment Doc

Este documento detalha o funcionamento e a configuração da automação de integração e entrega contínua (CI/CD) do ecossistema INVIS.

## 🚀 Pipeline de Integração Contínua (GitHub Actions)

O arquivo de configuração reside em `/.github/workflows/ci-cd.yml` e é acionado automaticamente em eventos de:
1. **Push** nas ramificações `main` ou `master`.
2. **Pull Request** direcionados para as ramificações `main` ou `master`.

### Etapas do Pipeline:

1. **Validação & Build (`validate-and-build`)**:
   - Inicializa em um contêiner Ubuntu atualizado.
   - Instala o Node.js v20.
   - Executa a verificação estática de tipos do TypeScript com `npm run lint`.
   - Compila o frontend compilado e o servidor backend empacotado através do `npm run build`.

2. **Entrega Contínua para Vercel (`deploy-production`)**:
   - É ativado apenas ao consolidar novos pushes nas branches principais (`main` ou `master`).
   - Obtém informações do projeto da Vercel.
   - Cria o artefato otimizado utilizando o ambiente de produção isolado (`vercel build --prod`).
   - Sobe o build compilado direto para as bordas globais de produção (`vercel deploy --prebuilt --prod`).

---

## 🔐 Configuração das Credenciais do GitHub Secrets

Para que o pipeline de deploy opere com segurança no repositório `inviscoin/inviscore`, configure os seguintes segredos em **Settings > Secrets and variables > Actions > Repository secrets** no GitHub:

| Chave do Secret | Descrição / Origem |
| :--- | :--- |
| `VERCEL_TOKEN` | Token de acesso pessoal gerado em sua conta Vercel (Tokens). |
| `VERCEL_ORG_ID` | Identificador de Organização/Equipe Vercel. |
| `VERCEL_PROJECT_ID` | Identificador único do projeto criado na Vercel para o INVIS. |
| `VITE_SUPABASE_URL` | `https://boguvusudhusqvwhgywu.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Chave de acesso anônima de produção do Supabase PostgreSQL. |

---

## 🔋 Matriz das APIs Sincronizadas

As seguintes APIs foram identificadas a partir do documento diretório-mãe e estão consolidadas no arquivo `.env` para execução transparente do ecossistema principal:

- **Supabase Principal (PostgreSQL)**: Conectado à infraestrutura em `boguvusudhusqvwhgywu.supabase.co`.
- **Facebook Developer Integration**: App ID `2090067485183087` configurado com chave secreta segura.
- **Stripe & Mercado Pago**: Chaves de produção prontas para processamento transacional.
- **LiveKit & TURN Services (Metered.co)**: Websockets e servidores STUN/TURN ativados para comunicação segura e barramento WebRTC.
- **TMDB**: API de mídias e chaves v3 prontas.
