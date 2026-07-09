import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

const prismaConfig = {
  log: (process.env.NODE_ENV === 'production'
    ? ['error', 'warn']
    : ['query', 'error', 'warn']) as any,
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  // Transaction timeouts for production
  // Connection pool is configured via DATABASE_URL parameters:
  //   ?connection_limit=20&pool_timeout=10
  // Without these, Prisma defaults to num_cpus*2+1 (3 on 1 vCPU),
  // causing connection exhaustion under concurrent load.
  ...(process.env.NODE_ENV === 'production' ? {
    transactionOptions: {
      maxWait: 10000,       // Max wait for transaction (10s)
      timeout: 20000,       // Max transaction duration (20s)
    },
  } : {}),
};

export const prisma = globalForPrisma.prisma || new PrismaClient(prismaConfig);

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;