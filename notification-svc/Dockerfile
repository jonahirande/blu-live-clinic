FROM node:18-alpine

WORKDIR /app

# Copy dependency definitions
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application source code
COPY . .

EXPOSE 5001

CMD ["node", "index.js"]