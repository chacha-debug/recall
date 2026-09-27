import type { Config } from 'drizzle-kit';

export default {
  schema: './lib/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: 'postgresql://neondb_owner:npg_d1sADNh8flcE@ep-orange-snow-zasdwahd-pooler.c-2.eu-west-2.aws.neon.tech/neondb?channel_binding=require&sslmode=require',
    ssl: 'require',
  },
} satisfies Config;