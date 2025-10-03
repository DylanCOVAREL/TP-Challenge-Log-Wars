# ------ STAGE 1: build ------
FROM node:20-slim AS builder
WORKDIR /app

# Outils utiles au build (git si monorepo / deps depuis git)
RUN apt-get update && apt-get install -y --no-install-recommends \
  ca-certificates git \
  && rm -rf /var/lib/apt/lists/*

# Dépendances (avec dev) — cache-friendly
COPY package.json package-lock.json* ./
RUN npm ci --no-audit --no-fund

# Sources & config
COPY tsconfig.json ./
COPY src ./src
COPY queries ./queries

# Build -> dist
RUN npm run build

# ------ STAGE 2: runtime ------
FROM node:20-slim
WORKDIR /app

RUN useradd -m -u 10001 nodeapp

RUN apt-get update && apt-get install -y --no-install-recommends \
  ca-certificates tini \
  && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production

COPY package.json package-lock.json* ./
RUN npm ci --only=production --no-audit --no-fund

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/queries ./queries
COPY entrypoint.sh /entrypoint.sh

# Ajout du binaire engine
RUN printf '#!/bin/sh\nexec node /app/dist/cli.js "$@"\n' > /usr/local/bin/engine \
    && chmod +x /usr/local/bin/engine

RUN mkdir -p /data /out /index && \
    chown -R nodeapp:nodeapp /app /data /out /index && \
    chmod +x /entrypoint.sh

ENV DATASET=/data/logs_S.csv
ENV QUERIES=/queries/suite_public.json
ENV RUNS=5
ENV INDEX_DIR=/index

ENTRYPOINT ["/usr/bin/tini","--","/entrypoint.sh"]
CMD ["help"]

USER nodeapp

