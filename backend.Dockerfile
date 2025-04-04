FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --omit=dev

# Copy source code and shared modules
COPY server ./server
COPY shared ./shared
COPY tsconfig.json .

# Build the application
RUN npm run build

# Set environment variables
ENV NODE_ENV=production
ENV PORT=8080
ENV DATABASE_URL=postgresql://user:password@localhost:5432/dbname
ENV JWT_SECRET=your-secret-key
ENV SESSION_SECRET=your-session-secret
ENV GOOGLE_API_KEY=your-google-api-key

# Create dist/public directory
RUN mkdir -p dist/public

# Expose port 8080
EXPOSE 8080

# Start the application
CMD ["node", "dist/index.js"] 