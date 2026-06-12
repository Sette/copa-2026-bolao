# ── Build Stage ──
FROM node:22-alpine AS builder

WORKDIR /app

# Dependências nativas para compilar o adapter pg
RUN apk add --no-cache python3 make g++

# Cache das dependências (sem rodar scripts, prisma ainda não tem schema)
# .npmrc garante que postinstall nunca rode, mesmo sem --ignore-scripts
RUN echo 'ignore-scripts=true' > .npmrc
COPY package.json package-lock.json ./
RUN npm ci

# Copiar schema e gerar Prisma Client
COPY prisma ./prisma
COPY prisma.config.ts ./
RUN npx prisma generate

# Copiar resto do código e buildar
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ── Production Stage ──
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copiar o standalone (servidor Next.js otimizado)
COPY --from=builder /app/.next/standalone ./

# Copiar assets estáticos e public
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Copiar dependências completas para o Prisma CLI funcionar no boot (db push + runtime)
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts

# Script de entrypoint
COPY --from=builder /app/start.sh ./start.sh
RUN chmod +x ./start.sh

# Diretório para dados persistentes (settings, SQLite)
RUN mkdir -p data && chown nextjs:nodejs data

# Dependências de runtime (pg_dump, pg_isready etc para PostgreSQL)
RUN apk add --no-cache postgresql-client

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["./start.sh"]
