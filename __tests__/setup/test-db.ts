import { PrismaClient } from '@prisma/client';

let prisma: PrismaClient;

export function getTestDb() {
  if (!prisma) {
    // Use the existing database connection from environment
    // In a production test setup, you'd use a separate test database
    prisma = new PrismaClient();
  }
  return prisma;
}

export async function setupTestDb() {
  const db = getTestDb();
  
  // Run migrations to set up schema
  // Note: In a real setup, you'd use prisma migrate or db push
  // For now, we'll rely on the schema being applied
  
  return db;
}

export async function cleanupTestDb() {
  const db = getTestDb();
  
  // Clean up all tables in reverse order of dependencies
  await db.usageLog.deleteMany();
  await db.message.deleteMany();
  await db.chatSession.deleteMany();
  await db.user.deleteMany();
  await db.aPIKey.deleteMany();
  await db.admin.deleteMany();
  await db.blogPost.deleteMany();
}

export async function disconnectTestDb() {
  if (prisma) {
    await prisma.$disconnect();
  }
}
