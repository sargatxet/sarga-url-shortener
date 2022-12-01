FROM alpine:3

RUN apk update && \
    add --no-cache nodejs npm yarn

WORKDIR /app
COPY package.json ./
COPY yarn.lock ./

RUN yarn install
COPY . .

CMD ["node", "index.js"]
