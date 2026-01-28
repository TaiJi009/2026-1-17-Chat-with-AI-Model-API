import { Pool, PoolConfig } from 'pg';
import dotenv from 'dotenv';
import { debug } from '../utils/debug';

dotenv.config();

const dbConfig: PoolConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME || 'chat_app',
  user: process.env.DB_USER || 'user',
  password: process.env.DB_PASSWORD || 'password',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

// 如果提供了完整的DATABASE_URL，使用它
if (process.env.DATABASE_URL) {
  const url = new URL(process.env.DATABASE_URL);
  dbConfig.host = url.hostname;
  dbConfig.port = parseInt(url.port || '5432', 10);
  dbConfig.database = url.pathname.slice(1);
  dbConfig.user = url.username;
  dbConfig.password = url.password;
}

const pool = new Pool(dbConfig);

pool.on('error', (err) => {
  // #region agent log
  debug.error('Database Pool Error', err, 'db-pool-error');
  // #endregion
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// #region agent log
debug.log('Database pool initialized', { 
  host: dbConfig.host, 
  database: dbConfig.database,
  max: dbConfig.max 
}, 'db-init');
// #endregion

export default pool;
