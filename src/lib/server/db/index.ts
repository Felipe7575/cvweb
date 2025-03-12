import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from './schema';
import * as relations from './relations'; // Importa las relaciones
import { env } from '$env/dynamic/private';

if (!env.AUTH_DRIZZLE_URL) throw new Error('DATABASE_URL is not set');

const client = neon(env.AUTH_DRIZZLE_URL);

export const db = drizzle(client, {
  schema: { ...schema, ...relations }, // Incluye las relaciones
});
