FROM oven/bun:latest

WORKDIR /app

COPY package.json ./
COPY tsconfig.json ./
COPY src ./src
COPY lib ./lib

RUN bun i
RUN bun run build

EXPOSE 3000

ENTRYPOINT [ "bun", "run", "build/server.js" ]
