# Build context is the repo root so Alex's ledger/ module ships in the image:
#   docker build -f api/Dockerfile --platform linux/arm64 .
# Node 24: loads ledger/src/index.ts natively (type stripping), per ledger/README.md.
FROM node:24-alpine AS build
WORKDIR /app/api
COPY api/package.json api/package-lock.json api/.npmrc ./
RUN npm ci --no-audit --no-fund
COPY api/tsconfig.json api/tsconfig.build.json ./
COPY api/src ./src
RUN npm run build && npm prune --omit=dev

FROM node:24-alpine
ENV NODE_ENV=production PORT=8080
WORKDIR /app
# Alex's ledger module (TypeScript, loaded directly). Seeds come from Secrets Manager, never the image.
COPY ledger ./ledger
RUN if [ -f ledger/package.json ]; then cd ledger && npm ci --omit=dev --no-audit --no-fund || npm install --omit=dev --no-audit --no-fund; fi
COPY --from=build /app/api/node_modules ./api/node_modules
COPY --from=build /app/api/dist ./api/dist
COPY --from=build /app/api/package.json ./api/package.json
WORKDIR /app/api
USER node
EXPOSE 8080
HEALTHCHECK --interval=15s --timeout=3s --retries=3 CMD wget -qO- http://127.0.0.1:8080/health || exit 1
CMD ["node", "dist/server.js"]
