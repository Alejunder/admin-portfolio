import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

// PrismaClient is attached to the global object in development to prevent
// exhausting your database connection limit.
const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Get DATABASE_URL and remove any SSL parameters to configure them manually
let connectionString = process.env.DATABASE_URL || '';
const isLocal = connectionString.includes('localhost') || connectionString.includes('127.0.0.1');

// Strip any existing SSL parameters from the connection string
connectionString = connectionString.split('?')[0];

const pool = new Pool({
  connectionString,
  ssl: isLocal ? false : {
    rejectUnauthorized: false,
  },
});
const adapter = new PrismaPg(pool);

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
