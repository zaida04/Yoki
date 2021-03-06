FROM node:14-alpine
LABEL name "Yoki BOT"
LABEL version "0.0.1"

WORKDIR /usr/yoki

RUN apk add --update \
    && apk add --no-cache ca-certificates \
    && apk add --no-cache --virtual .build-deps curl

RUN curl -L https://unpkg.com/@pnpm/self-installer | node && apk del .build-deps

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.json ./
COPY libs/logger/package.json ./libs/logger/
COPY src/bot/package.json ./src/bot/

ENV TOKEN= \
    DEFAULTPREFIX= \
    NODE_ENV=

RUN pnpm i --recursive

COPY . .
RUN pnpm run build && pnpm prune --prod
RUN pnpm run knex:init

CMD [ "node", "src/bot/dist/index.js"]
