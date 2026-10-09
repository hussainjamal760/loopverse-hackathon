import path from 'path';
import fs from 'fs';
import { seedDatabase } from '../src/server/db/seed';

// Load environment variables if loadEnvFile exists
if (typeof (process as any).loadEnvFile === 'function') {
  const envPath = path.resolve(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    (process as any).loadEnvFile(envPath);
  }
}

async function main() {
  try {
    console.log('[Seed] Executing ExamSlot database seed...');
    await seedDatabase();
    console.log('[Seed] Seed process finished successfully.');
    process.exit(0);
  } catch (error) {
    console.error('[Seed] Seed execution failed:', error);
    process.exit(1);
  }
}

main();
