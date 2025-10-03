# Dockerfile
FROM node:20-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
  build-essential \
  ca-certificates \
  && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json* ./
RUN npm ci --only=production || npm install --no-audit --no-fund

COPY src ./src
COPY queries ./queries

RUN mkdir -p /data /out /index

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENV DATASET=/data/logs_M.csv
ENV QUERIES=/queries/suite_public.json
ENV RUNS=5
ENV INDEX_DIR=/index

RUN npm prune --production || true

ENTRYPOINT ["/entrypoint.sh"]
CMD ["help"]