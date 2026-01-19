import pool from '../src/config/database';
import { readFileSync } from 'fs';
import { join } from 'path';

async function runMigrations() {
  try {
    const migrationFile = readFileSync(
      join(__dirname, '001_initial.sql'),
      'utf-8'
    );
    
    await pool.query(migrationFile);
    console.log('数据库迁移完成');
    process.exit(0);
  } catch (error) {
    console.error('数据库迁移失败:', error);
    process.exit(1);
  }
}

runMigrations();
