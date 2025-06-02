# ---------------------- BASE IMAGE ----------------------
FROM node:22-slim AS base

RUN apt-get update && apt-get upgrade -y && \
    apt-get clean && rm -rf /var/lib/apt/lists/*
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# ---------------------- PREPARE WORKSPACE (DEPS + SOURCE) ----------------------
FROM base AS prepare_workspace
WORKDIR /app

# Копируем манифесты воркспейса
COPY pnpm-workspace.yaml ./
COPY pnpm-lock.yaml ./
COPY package.json ./
COPY backend/package.json ./backend/
COPY frontend/package.json ./frontend/
COPY shared/package.json ./shared/
COPY backend/tsconfig.json ./backend/

# Копируем ВЕСЬ остальной исходный код проекта
COPY . .

# Устанавливаем зависимости, включая devDependencies, так как они нужны для сборки
RUN pnpm install --frozen-lockfile

# ---------------------- BUILD ----------------------
FROM prepare_workspace AS build
# Копируем .env файлы, если они нужны на этапе сборки
COPY etc/secrets/.frontend.env ./frontend/.env
COPY etc/secrets/.backend.env ./backend/.env

RUN pnpm b pgc
RUN pnpm build

# ---------------------- FINAL (PRODUCTION) ----------------------
FROM node:22-slim AS prod
WORKDIR /app

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
ENV NODE_ENV=production

# Копируем package.json и pnpm-workspace.yaml для правильной структуры workspace
COPY package.json pnpm-workspace.yaml ./
COPY backend/package.json ./backend/
COPY shared/package.json ./shared/
COPY backend/tsconfig.json ./backend/
# Копируем node_modules из build стадии (они уже содержат все нужные зависимости)
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/backend/node_modules ./backend/node_modules

# Копируем артефакты сборки
COPY --from=build /app/backend/dist ./backend/dist
COPY --from=build /app/frontend/dist ./frontend/dist 

# Копируем .env для runtime бэкенда
COPY etc/secrets/.backend.env ./backend/.env

COPY entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh
RUN apt-get update -y && apt-get install -y openssl

HEALTHCHECK --interval=30s --timeout=3s \
  CMD curl -f http://localhost:3000/ping || exit 1

EXPOSE 3000


# RUN pnpm b preset-db 
# RUN pnpm b preset-paronyms
ENTRYPOINT ["/app/entrypoint.sh"]