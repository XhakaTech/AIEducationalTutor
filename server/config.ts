import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env file
dotenv.config({ path: resolve(__dirname, '../.env') });

// Validate required environment variables
const requiredEnvVars = ['DATABASE_URL', 'SESSION_SECRET', 'GOOGLE_API_KEY', 'JWT_SECRET'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

export const config = {
  databaseUrl: process.env.DATABASE_URL,
  sessionSecret: process.env.SESSION_SECRET,
  googleApiKey: process.env.GOOGLE_API_KEY,
  jwtSecret: process.env.JWT_SECRET,
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development'
}; 