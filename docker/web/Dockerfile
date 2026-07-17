# Marsquakes Web Development
FROM node:18-alpine

# Install pnpm
RUN npm install -g pnpm@9.15.0

WORKDIR /app

# Copy workspace config first (for layer caching)
COPY package.json pnpm-workspace.yaml turbo.json ./
COPY packages/tsconfig/package.json ./packages/tsconfig/
COPY packages/eslint-config/package.json ./packages/eslint-config/
COPY apps/web-admin/package.json ./apps/web-admin/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

EXPOSE 3100

CMD ["pnpm", "dev", "--filter=web"]
