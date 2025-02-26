FROM node:22-slim

RUN mkdir -p /app/node_modules && chown -R node:node /app

WORKDIR /app

USER node

COPY . .

RUN npm install

COPY --chown=node:node . .

RUN npm run build

EXPOSE 8080

CMD [ "npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "8080" ]
