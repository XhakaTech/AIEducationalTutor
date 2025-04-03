
import fs from 'fs';
import path from 'path';
import { db, pool } from '../db';
import { sql } from 'drizzle-orm';

async function applyMigration() {
  try {
    console.log('Applying database migration...');
    
    const migrationFilePath = path.join(process.cwd(), 'migrations', '001-update-schema.sql');
    const migrationSQL = fs.readFileSync(migrationFilePath, 'utf8');
    
    // Execute the migration SQL
    await pool.query(migrationSQL);
    
    console.log('Migration applied successfully!');
    
    // Insert sample data or perform other operations if needed
    
    process.exit(0);
  } catch (error) {
    console.error('Error applying migration:', error);
    process.exit(1);
  }
}

applyMigration();
