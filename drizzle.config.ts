import type { Config } from 'drizzle-kit';
import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env.local') });

let url = process.env.POSTGRES_URL;
if (!url) {
  throw new Error('POSTGRES_URL is not set');
}

url = url.replace(/^"|"$/g, '').trim().split('?')[0];

export default {
  schema: './lib/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url,
    ssl: 'require',
  },
} satisfies Config;