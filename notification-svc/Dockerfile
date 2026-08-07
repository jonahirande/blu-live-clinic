FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
# 1. Install ALL dependencies (including build tools in devDependencies)
RUN npm install

COPY . .

ENV CI=false
# 2. Build the app
RUN npm run build

# 3. Optional: Prune devDependencies to keep image size small
RUN npm prune --production

EXPOSE 5001

CMD ["node", "index.js"]