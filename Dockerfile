FROM node:20-alpine

WORKDIR /app

# Copy package manifests first (better caching)
COPY package*.json ./

# Install ALL deps — including devDependencies, because tsc is needed to build
RUN npm install

# Copy source code + tsconfig
COPY . .

# Compile TypeScript → dist/
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]