import postgres from 'postgres';
import { env } from '$env/dynamic/private';

// Initialize and export the postgres client
const sql = postgres({
  host: env.VITE_DB_HOST,
  database: env.VITE_DB_NAME,
  username: env.VITE_DB_USER,
  password: env.VITE_DB_PASSWORD,
  port: Number(env.VITE_DB_PORT) || 5432,
  ssl: env.VITE_DB_SSL === 'true'
});

// Export the SQL client directly - no intermediate functions
export default sql;

// Log that we're initializing the database connection
console.log('Initializing database connection...');

// Type helper for query results
export type QueryResult<T> = T[];

// Helper function for querying with proper types
export async function query<T>(queryString: string, params: any[] = []): Promise<T[]> {
  if (!sql) {
    console.error('Database connection not established');
    throw new Error('Database connection not established');
  }
  
  try {
    // Convert string+params to proper SQL template literal
    return await sql.unsafe(queryString, params) as T[];
  } catch (error) {
    console.error('Database query failed:', error);
    throw error;
  }
} 