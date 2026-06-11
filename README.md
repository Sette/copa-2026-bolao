# ⚽ Bolão Copa 2026

App para jogar bolão da Copa do Mundo 2026 com seus amigos online.

## Como funciona

1. **Crie seu bolão** — em segundos, você cria um bolão e recebe um código de convite
2. **Convide amigos** — compartilhe o código para seus amigos entrarem
3. **Palpite os placares** — antes de cada partida, dê seu palpite no placar exato
4. **Acompanhe o ranking** — veja quem lidera o bolão com mais pontos

## Pontuação

| Resultado | Pontos |
|-----------|--------|
| Placar exato | 5 pts |
| Acertou vencedor/empate | 3 pts |
| Errou | 0 pts |

## Stack

- **Frontend:** Next.js 16 (App Router) + React 19 + TailwindCSS 4
- **Backend:** Next.js API Routes + Prisma 7
- **Banco:** PostgreSQL
- **Auth:** NextAuth.js v5 + Google OAuth
- **Deploy:** Railway

## Rodando localmente

### Pré-requisitos

- Node.js 22+
- PostgreSQL (local ou Railway)

### Setup

```bash
# 1. Clone o repo
git clone <repo-url>
cd bolao-copa

# 2. Instale dependências
npm install

# 3. Configure as variáveis de ambiente
cp .env.example .env.local
# Edite .env.local com suas credenciais

# 4. Configure o banco de dados
npx prisma db push
npx prisma generate

# 5. Popule as partidas da Copa
npm run db:seed

# 6. Rode o app
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000)

### Variáveis de ambiente

| Variável | Descrição |
|----------|-----------|
| `DATABASE_URL` | URL do PostgreSQL |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `NEXTAUTH_URL` | URL base do app (local: `http://localhost:3000`) |
| `NEXTAUTH_SECRET` | Chave secreta (`openssl rand -base64 32`) |
| `ADMIN_EMAILS` | Emails de admin separados por vírgula |

## Deploy

### Railway via Docker (Recomendado)

1. Conecte o repositório GitHub ao [Railway](https://railway.app)
2. Adicione o plugin **PostgreSQL**
3. Configure as variáveis de ambiente (Google OAuth, NextAuth, Admin)
4. Railway detecta o `Dockerfile` automaticamente e faz o build
5. Após o deploy, execute o seed pelo Railway CLI:
   ```bash
   railway run "npx tsx prisma/seed.ts"
   ```

### Railway via Nixpacks

O `railway.json` já está configurado. Se preferir Nixpacks, remova o `Dockerfile`.

### Docker local

```bash
docker build -t bolao-copa .
docker run -p 3000:3000 --env-file .env.local bolao-copa
```

## Admin

Admins podem gerenciar partidas em `/admin/matches`:
- Inserir placar real das partidas
- Os pontos de todos os palpites são recalculados automaticamente
- Emails de admin configurados via `ADMIN_EMAILS`
