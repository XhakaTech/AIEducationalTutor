# Build stage
FROM node:20-alpine as builder

WORKDIR /app

# Copy package files
COPY client/package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY client ./

# Build the application
RUN npm run build

# Copy index.html to dist directory
RUN cp client/index.html client/dist/

FROM node:20-alpine
WORKDIR /app

# Install express
RUN npm init -y && npm install express

COPY --from=builder /app/dist ./dist
COPY client/server.js .

EXPOSE 8080

CMD ["node", "server.js"] 