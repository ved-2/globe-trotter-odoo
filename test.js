// test-mongo.js
import mongoose from 'mongoose';
import 'dotenv/config';

(async () => {
  try {
    console.log('🔍 Trying to connect to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err);
    process.exit(1);
  }
})();
