import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
// Also fallback to root .env or backend .env if MONGODB_URI is not set
if (!process.env.MONGODB_URI && !process.env.DATABASE_URL) {
  dotenv.config({ path: path.resolve(process.cwd(), '../backend/.env') });
}

import { seedDatabase } from '../src/server/db/seed.ts';

async function main() {
  try {
    console.log('🚀 Executing ExamSlot database seed...');
    await seedDatabase();
    console.log('✨ Seed process finished successfully.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed execution failed:', error);
    process.exit(1);
  }
}

main();
