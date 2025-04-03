
import fs from 'fs';
import path from 'path';
import { db, pool } from '../db';
import { sql } from 'drizzle-orm';

async function runMigration(migrationFile: string) {
  try {
    console.log(`Applying database migration: ${migrationFile}...`);
    
    const migrationFilePath = path.join(process.cwd(), 'migrations', migrationFile);
    const migrationSQL = fs.readFileSync(migrationFilePath, 'utf8');
    
    // Execute the migration SQL
    await pool.query(migrationSQL);
    
    console.log('Migration applied successfully!');
    
    process.exit(0);
  } catch (error) {
    console.error('Error applying migration:', error);
    process.exit(1);
  }
}

// Get migration file from command line argument or use default
const migrationFile = process.argv[2] || '002-add-crypto-tables.sql';
runMigration(migrationFile);
