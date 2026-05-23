# -------------------------------------------------------------------
# STAGE 1: Pruner
# Improve build times by only copying necessary files
# -------------------------------------------------------------------
FROM node:24-alpine AS pruner
WORKDIR /app
RUN npm install -g turbo
COPY . .
RUN turbo prune --scope=@ems-portal/backend --docker

# -------------------------------------------------------------------
# STAGE 2: Builder
# Installs deps and compiles the code
# -------------------------------------------------------------------
FROM node:24-alpine AS builder
WORKDIR /app

COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/yarn.lock ./yarn.lock

# Installation to download everything needed for build
# Add --ignore-scripts to stop it from running "postinstall" or "prepare"
RUN yarn install --frozen-lockfile --ignore-scripts

# Copy the full source code (backend + types)
COPY --from=pruner /app/out/full/ .

# Build Backend, when we build backend, it will also build 'types' as it's a dependency
RUN yarn turbo run build --filter=@ems-portal/backend...

# Install dependencies for production -> This is much more lightweight
RUN yarn install --production --ignore-scripts --prefer-offline

# -------------------------------------------------------------------
# STAGE 3: Runner
# -------------------------------------------------------------------
FROM node:24-alpine AS runner
WORKDIR /app

# Create a non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs
USER nestjs

# Copy only the production node_modules from both root and backend package
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/packages/backend/node_modules* ./packages/backend/node_modules/

# Copy the Built Backend Package
COPY --from=builder --chown=nestjs:nodejs /app/packages/backend/dist ./packages/backend/dist

# Copy the Built Shared 'Types' Package
COPY --from=builder --chown=nestjs:nodejs /app/packages/shared/types/package.json ./packages/shared/types/package.json
COPY --from=builder --chown=nestjs:nodejs /app/packages/shared/types/dist ./packages/shared/types/dist
# Set Env Vars
ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

# Start the application
CMD ["node", "packages/backend/dist/src/main.js"]