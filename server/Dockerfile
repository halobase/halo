FROM oven/bun:1.2.1

# WORKDIR /app

# COPY package.json ./
# COPY tsconfig.json ./
# COPY src ./src
# COPY lib ./lib


# RUN bun i
# RUN bun run build

# EXPOSE 3000

# ENTRYPOINT [ "bun", "run", "build/server.js" ]
WORKDIR /app

# 复制依赖文件并安装
COPY package.json ./ 
COPY tsconfig.json ./
COPY src ./src
COPY lib ./lib

RUN bun i


RUN bun build src/index.ts --target=bun --outfile=build/server.js

EXPOSE 3000

ENTRYPOINT ["bun", "./build/server.js"]