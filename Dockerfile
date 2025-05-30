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

# Копируем ВЕСЬ остальной исходный код проекта
# Убедитесь, что .dockerignore настроен правильно, чтобы не копировать лишнее (например, локальные node_modules)
COPY . .

# Устанавливаем зависимости, включая devDependencies, так как они нужны для сборки
RUN pnpm install --frozen-lockfile

# ---------------------- BUILD ----------------------
FROM prepare_workspace AS build
# WORKDIR /app уже установлен из prepare_workspace

# Копируем .env файлы, если они нужны на этапе сборки (например, VITE_* в фронте)
# Эти пути должны быть относительно контекста сборки Docker (где лежит Dockerfile)
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

# Копируем package.json и pnpm-workspace.yaml для запуска через pnpm
COPY package.json pnpm-workspace.yaml ./
COPY backend/package.json ./backend/
# Если backend имеет прямые workspace-зависимости от shared, которые не встроены в bundle:
# COPY shared/package.json ./shared/

# Копируем только production node_modules (или все, если pnpm их отфильтрует при запуске)
# и артефакты сборки
COPY --from=prepare_workspace /app/node_modules ./node_modules
COPY --from=build /app/backend/dist ./backend/dist
COPY --from=build /app/frontend/dist ./frontend/dist 
# Если фронтенд нужно раздавать с этого же сервера

# Копируем .env для runtime бэкенда
COPY etc/secrets/.backend.env ./backend/.env


HEALTHCHECK --interval=30s --timeout=3s \
  CMD curl -f http://localhost:3000/ping || exit 1

EXPOSE 3000

CMD ["pnpm", "--filter", "@russian-stress-practice/backend", "start"]