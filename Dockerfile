# Dockerfile
# A Dockerfile is a RECIPE for a "container image": a lunchbox that holds
# our app plus everything it needs to run (Node.js, libraries, files).
# Any computer with Docker can open the lunchbox and run the app exactly
# the same way, so "but it works on my computer!" stops being a problem.
#
# We cook in TWO stages:
#   1. "build" stage: a big kitchen with all the tools, to install libraries
#   2. "run" stage:   a small, clean lunchbox with only what the app needs

# ---------- Stage 1: install the libraries ----------
FROM node:22-bookworm AS build
WORKDIR /app

# Copy only the shopping lists first. Docker remembers (caches) this step,
# so libraries are only re-installed when the lists change.
COPY package.json package-lock.json ./

# "npm ci" installs the exact versions in package-lock.json.
# --omit=dev skips test tools: the real app doesn't need them.
RUN npm ci --omit=dev

# ---------- Stage 2: the small lunchbox that actually runs ----------
FROM node:22-bookworm-slim
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV DB_PATH=/app/data/todos.db

# Bring over the installed libraries from stage 1, then our own code.
COPY --from=build /app/node_modules ./node_modules
COPY package.json ./
COPY backend ./backend
COPY frontend ./frontend

# A folder for the database file, owned by the "node" user.
RUN mkdir -p /app/data && chown node:node /app/data

# SAFETY: don't run as "root" (the all-powerful admin user).
# If something went wrong, a normal user can do much less damage.
USER node

# The app listens on door (port) 3000 inside the container.
EXPOSE 3000

# Docker asks GET /health every 30 seconds to check the app is alive.
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://localhost:' + process.env.PORT + '/health').then((r) => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

# The command that starts the app when the container starts.
CMD ["node", "backend/server.js"]
