FROM node:18-bullseye

WORKDIR /usr/src/app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Build Next.js
RUN npm run build

EXPOSE 3000

# Start Next.js
CMD ["npm", "start"]
