# Use debian slim as base for better security
FROM node:22-slim AS base

# Update apt-get and upgrade packages
RUN apt-get update && apt-get upgrade -y && apt-get clean && rm -rf /var/lib/apt/lists/*

# Add non-root user
RUN groupadd -r appuser && useradd -r -g appuser appuser

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS deps
WORKDIR /app
COPY --chown=appuser:appuser pnpm-workspace.yaml ./
COPY --chown=appuser:appuser package.json ./
COPY --chown=appuser:appuser backend/package.json ./backend/
COPY --chown=appuser:appuser frontend/package.json ./frontend/
COPY --chown=appuser:appuser shared/package.json ./shared/
COPY --chown=appuser:appuser pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod

FROM deps AS build
COPY --chown=appuser:appuser . .
RUN pnpm run -r build

FROM base AS prod
WORKDIR /app

# Copy build artifacts and dependencies
COPY --chown=appuser:appuser --from=build /app/backend/dist ./backend/dist
COPY --chown=appuser:appuser --from=build /app/frontend/dist ./frontend/dist
COPY --chown=appuser:appuser --from=deps /app/node_modules ./node_modules
COPY --chown=appuser:appuser --from=deps /app/backend/node_modules ./backend/node_modules
COPY --chown=appuser:appuser --from=deps /app/frontend/node_modules ./frontend/node_modules
COPY --chown=appuser:appuser --from=deps /app/shared/node_modules ./shared/node_modules
COPY --chown=appuser:appuser backend/package.json ./backend/package.json
COPY --chown=appuser:appuser frontend/package.json ./frontend/package.json
COPY --chown=appuser:appuser shared/package.json ./shared/package.json
COPY --chown=appuser:appuser backend/.env.production ./backend/.env.production
COPY --chown=appuser:appuser frontend/.env.production ./frontend/.env.production

# Set proper permissions
RUN chown -R appuser:appuser /app

ENV NODE_ENV=production

# Switch to non-root user
USER appuser

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=3s \
  CMD curl -f http://localhost:3000/health || exit 1

EXPOSE 3000

CMD ["pnpm", "--filter", "backend", "start"]
