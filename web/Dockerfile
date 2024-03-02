FROM node:20-alpine

WORKDIR /app

COPY ./ ./

RUN npm i
RUN npm run build

ENTRYPOINT [ "node", "build" ]
