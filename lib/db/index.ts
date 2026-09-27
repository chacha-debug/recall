import 'server-only';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const url = process.env.DATABASE_URL;
if (!url) {
  throw new Error('DATABASE_URL is not set');
}

// Strip query params and force SSL — Neon requires SSL
const queryClient = postgres(url.split('?')[0], {
  prepare: false,
  ssl: 'require',
  max: 1, // single connection for serverless
});

export const db = drizzle(queryClient, { schema });