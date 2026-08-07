FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

ENV CI=false
RUN npm run build

EXPOSE 5001

CMD ["node", "index.js"]
