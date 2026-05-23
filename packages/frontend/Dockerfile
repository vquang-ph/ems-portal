# -------------------------------------------------------------------
# STAGE 1: Pruner
# Improve build times by only copying necessary files
# -------------------------------------------------------------------
FROM node:24-alpine AS pruner
WORKDIR /app
RUN npm install -g turbo
COPY . .
RUN turbo prune --scope=@ems-portal/frontend --docker

# -------------------------------------------------------------------
# STAGE 2: Builder
# Installs deps and compiles the code
# -------------------------------------------------------------------
FROM node:24-alpine AS builder
WORKDIR /app

ARG APP_BACKEND_URL

# Set to Environment Variable (So 'yarn build' can read it)
ENV APP_BACKEND_URL=$APP_BACKEND_URL

COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/yarn.lock ./yarn.lock
RUN yarn install --frozen-lockfile --ignore-scripts --network-timeout 100000

COPY --from=pruner /app/out/full/ .

# Build the frontend and types packages
RUN yarn turbo run build --filter=@ems-portal/frontend...

# -------------------------------------------------------------------
# STAGE 3: Runner
# -------------------------------------------------------------------
FROM node:24-alpine AS runner
WORKDIR /app

RUN npm install -g serve

# Copy the built assets
COPY --from=builder /app/packages/frontend/dist ./dist

# Expose the frontend port (3001 for Vite, or 3000 for Next)
EXPOSE 3001

# Start the server
CMD ["serve", "-s", "dist", "-l", "3001"]