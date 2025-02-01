FROM node:22-alpine
WORKDIR /app
COPY package*.json yarn.lock ./
RUN yarn install
COPY . .
CMD [ "node", "index.js" ]
