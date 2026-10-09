require('dotenv').config();
const mongoose = require('mongoose');
const { seedDatabase } = require('../features/seed/seed.service');

const mongoUri = process.env.DATABASE_URL || process.env.MONGODB_URI;

if (!mongoUri) {
  console.error('❌ Error: No DATABASE_URL or MONGODB_URI found in environment.');
  process.exit(1);
}

async function run() {
  try {
    console.log('Connecting to database:', mongoUri.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@'));
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB.');
    await seedDatabase();
    console.log('✨ Seed process complete.');
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed process failed:', error);
    process.exit(1);
  }
}

run();
