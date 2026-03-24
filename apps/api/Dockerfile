FROM node:20 AS builder

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
FROM node:20

WORKDIR /app

# Copy the whole node_modules from builder
COPY --from=builder /app/node_modules ./node_modules
# Copy the compiled API code
COPY --from=builder /app/apps/api/dist ./dist
# Copy the DB package (crucial for workspace resolution)
COPY --from=builder /app/packages/db ./packages/db
# Copy package.json files
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/apps/api/package.json ./apps/api/package.json

EXPOSE 3000

CMD ["node", "dist/main"]
