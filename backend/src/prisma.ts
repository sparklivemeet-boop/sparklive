import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

dotenv.config();

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error('DATABASE_URL environment variable is required');
}

const sqliteAdapter = new PrismaBetterSqlite3({ url: databaseUrl });
export const prisma = new PrismaClient({ adapter: sqliteAdapter });
