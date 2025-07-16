import dotenv from 'dotenv';
import mongoose from 'mongoose';
import FinancialItem from './src/models/FinancialItem.js';

// Load environment variables
dotenv.config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/finance-quiz');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

const testSeed = async () => {
  try {
    console.log('🌱 Testing database seeding...');
    
    // Test connection
    await connectDB();
    
    // Check if items exist
    const count = await FinancialItem.countDocuments();
    console.log(`📊 Current items in database: ${count}`);
    
    if (count === 0) {
      console.log('🗑️  No items found, seeding database...');
      
      // Import and run seeder
      const { seedDatabase } = await import('./src/utils/seeder.js');
      await seedDatabase();
      
      console.log('✅ Seeding completed!');
    } else {
      console.log('✅ Database already has items');
    }
    
    // Test query
    const items = await FinancialItem.find({ level: 1 }).limit(5);
    console.log(`📝 Found ${items.length} level 1 items`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
};

testSeed(); 