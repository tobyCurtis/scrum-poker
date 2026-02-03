# ---- build stage ----
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# ---- runtime stage ----
FROM denoland/deno:alpine-1.41.0 AS runtime
WORKDIR /app
COPY --from=build /app/public ./public
COPY --from=build /app/server.ts ./server.ts
COPY --from=build /app/deno.lock ./deno.lock

RUN deno cache server.ts

ENV PORT=3000
EXPOSE 3000

CMD ["run", "--allow-net", "--allow-read", "--allow-env", "server.ts"]
