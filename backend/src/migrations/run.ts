import fs from 'fs';
import path from 'path';
import { query } from '../config/database';

async function runMigrations() {
  try {
    console.log('开始运行数据库迁移...');

    const migrationFile = path.join(__dirname, '../../migrations/001_initial.sql');
    const sql = fs.readFileSync(migrationFile, 'utf-8');

    // 执行SQL
    await query(sql);

    console.log('数据库迁移完成！');
    process.exit(0);
  } catch (error) {
    console.error('数据库迁移失败:', error);
    process.exit(1);
  }
}

runMigrations();
