import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../shared/schema';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString);
const db = drizzle(client, { schema });

async function cleanup() {
  console.log('Cleaning up existing data...\n');
  
  // Delete in reverse order of dependencies
  await db.delete(schema.quizQuestions);
  await db.delete(schema.resources);
  await db.delete(schema.subtopics);
  await db.delete(schema.topics);
  await db.delete(schema.lessons);
  
  console.log('Cleanup completed successfully!');
  await client.end();
}

cleanup().catch(console.error); 