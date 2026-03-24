FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies (including devDependencies for build)
COPY package*.json ./
COPY apps/api/package*.json ./apps/api/
COPY packages/db/package*.json ./packages/db/

RUN npm install --legacy-peer-deps

# Copy source
COPY . .

# Generate Prisma Client
RUN cd packages/db && npx prisma generate

# Build API
RUN cd apps/api && npm run build

# Final Image
FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/apps/api/package.json ./package.json

EXPOSE 3000

CMD ["node", "dist/main"]
