# Dockerfile
# A Dockerfile is a RECIPE for a "container image": a lunchbox that holds
# our app plus everything it needs to run (Node.js, libraries, files).
# Any computer with Docker can open the lunchbox and run the app exactly
# the same way, so "but it works on my computer!" stops being a problem.
#
# We cook in THREE stages:
#   1. "deps"  : install all the libraries
#   2. "build" : turn our React + Next.js code into a fast, ready-to-run app
#   3. "run"   : a small, clean lunchbox with ONLY what the app needs

# ---------- Stage 1: install the libraries ----------
FROM node:22-bookworm AS deps
WORKDIR /app

# Copy only the shopping lists first. Docker remembers (caches) this step,
# so libraries are only re-installed when the lists change.
COPY package.json package-lock.json ./

# "npm ci" installs the exact versions in package-lock.json.
RUN npm ci

# ---------- Stage 2: build the app ----------
FROM node:22-bookworm AS build
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# "next build" checks the code and packs it into .next/standalone:
# a tiny server with only the files and libraries it really uses.
RUN npm run build

# ---------- Stage 3: the small lunchbox that actually runs ----------
FROM node:22-bookworm-slim AS run
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
# Listen on every network "door" inside the container, so Docker can reach us.
ENV HOSTNAME=0.0.0.0
ENV DB_PATH=/app/data/todos.db

# Bring over the packed app and its static files (JavaScript, CSS).
COPY --from=build --chown=node:node /app/.next/standalone ./
COPY --from=build --chown=node:node /app/.next/static ./.next/static

# A folder for the database file, owned by the "node" user.
RUN mkdir -p /app/data && chown node:node /app/data

# SAFETY: don't run as "root" (the all-powerful admin user).
# If something went wrong, a normal user can do much less damage.
USER node

# The app listens on door (port) 3000 inside the container.
EXPOSE 3000

# Docker asks GET /health every 30 seconds to check the app is alive.
HEALTHCHECK --interval=30s --timeout=3s --start-period=15s --retries=3 \
  CMD node -e "fetch('http://localhost:' + process.env.PORT + '/health').then((r) => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

# The command that starts the app when the container starts.
CMD ["node", "server.js"]
