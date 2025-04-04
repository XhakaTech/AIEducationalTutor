import './config';
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { seedDatabase } from "./storage";
import cors from 'cors';
import { config } from 'dotenv';
import { createServer } from 'http';
import path from 'path';
import { fileURLToPath } from 'url';

config();

// Get the directory name in ESM
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = parseInt(process.env.PORT || '8080', 10);

// Enable CORS for specific origins
app.use(cors({
  origin: [
    'https://gen-lang-client-0728091754.web.app',
    'https://xhakatutor.web.app',
    'http://localhost:5173'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Add health check endpoint
app.get('/_health', (req, res) => {
  res.status(200).send('OK');
});

// Add root endpoint for basic connectivity test
app.get('/', (req, res) => {
  res.status(200).send('Backend is running');
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  const publicPath = path.join(__dirname, '..', 'dist', 'public');
  app.use(express.static(publicPath));
  
  // Serve index.html for all routes except API routes
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/')) {
      return next();
    }
    res.sendFile(path.join(publicPath, 'index.html'));
  });
}

// Logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      console.log(logLine);
    }
  });

  next();
});

(async () => {
  try {
    // Seed the database with initial data
    try {
      await seedDatabase();
      console.log('Database initialization complete');
    } catch (error) {
      console.error(`Error initializing database: ${error}`);
    }

    // Register API routes
    await registerRoutes(app);

    // Error handling middleware
    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      console.error(`Error: ${message}`);
      res.status(status).json({ message });
    });

    // Create HTTP server
    const server = createServer(app);

    // Start the server - explicitly bind to 0.0.0.0 for Cloud Run
    server.listen(PORT, '0.0.0.0', () => {
      console.log(`Server listening on port ${PORT} in ${process.env.NODE_ENV} mode`);
      console.log(`Current directory: ${__dirname}`);
    });
  } catch (error) {
    console.error(`Fatal error: ${error}`);
    process.exit(1);
  }
})();
