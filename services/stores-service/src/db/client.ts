/**
 * GLENKEOS STORES SERVICE - Database Client
 *
 * PostgreSQL connection pool with Secrets Manager integration
 */

import { Pool, QueryResult } from 'pg';
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';

let pool: Pool | null = null;
let secretsCache: any = null;

/**
 * Get database credentials from AWS Secrets Manager
 */
async function getDbCredentials() {
  if (secretsCache) {
    return secretsCache;
  }

  const secretsManager = new SecretsManagerClient({ region: process.env.AWS_REGION || 'us-east-2' });

  const secretName = process.env.DB_SECRET_NAME || 'glenkeos/staging/database/master-password';

  try {
    const response = await secretsManager.send(
      new GetSecretValueCommand({ SecretId: secretName })
    );

    if (!response.SecretString) {
      throw new Error('Secret value is empty');
    }

    secretsCache = JSON.parse(response.SecretString);
    return secretsCache;

  } catch (error: any) {
    console.error('Error fetching database credentials:', error);
    throw error;
  }
}

/**
 * Get or create database connection pool
 */
async function getPool(): Promise<Pool> {
  if (pool) {
    return pool;
  }

  // If running locally, use environment variables
  if (process.env.DB_HOST && process.env.DB_PASSWORD) {
    pool = new Pool({
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME || 'glenkeos',
      user: process.env.DB_USER || 'glenkeos_admin',
      password: process.env.DB_PASSWORD,
      max: 10, // Maximum number of clients in the pool
      idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
      connectionTimeoutMillis: 2000 // Return an error after 2 seconds if connection cannot be established
    });

    console.log('Database pool created (local mode)');
    return pool;
  }

  // Production: use Secrets Manager
  const credentials = await getDbCredentials();

  pool = new Pool({
    host: credentials.host,
    port: credentials.port || 5432,
    database: credentials.dbname || 'glenkeos',
    user: credentials.username,
    password: credentials.password,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000
  });

  console.log('Database pool created (Secrets Manager)');
  return pool;
}

/**
 * Execute a database query
 */
export async function query(text: string, params?: any[]): Promise<QueryResult> {
  const client = await getPool();

  try {
    const start = Date.now();
    const result = await client.query(text, params);
    const duration = Date.now() - start;

    console.log('Query executed', {
      text,
      duration,
      rows: result.rowCount
    });

    return result;

  } catch (error: any) {
    console.error('Database query error:', {
      text,
      params,
      error: error.message
    });
    throw error;
  }
}

/**
 * Close database pool (for graceful shutdown)
 */
export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
    secretsCache = null;
    console.log('Database pool closed');
  }
}
