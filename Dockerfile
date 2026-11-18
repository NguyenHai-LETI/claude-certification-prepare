# Cloud deploy (Render free, or any Docker host). App code lives in /app; data (bank, notes, results, coach) is a fresh
# git clone in /data/repo made at every start by deploy/entrypoint.sh, and results go back to GitHub through the app's
# git sync — the container disk is wiped on every restart.
FROM node:22-bookworm-slim

RUN apt-get update \
  && apt-get install -y --no-install-recommends git ca-certificates \
  && rm -rf /var/lib/apt/lists/*

# Claude Code CLI for 🤖 AI (works only when ANTHROPIC_API_KEY is set)
RUN npm install -g @anthropic-ai/claude-code --no-audit --no-fund

WORKDIR /app
ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --no-audit --no-fund

COPY . .
RUN npx vite build \
  && mkdir -p /data \
  && chown -R node:node /app /data

USER node
ENV NODE_ENV=production \
    CERT_HOST=0.0.0.0 \
    CERT_USE_API_KEY=1 \
    PORT=10000
EXPOSE 10000

CMD ["sh", "deploy/entrypoint.sh"]
