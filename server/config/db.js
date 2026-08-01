import mongoose from 'mongoose';

export async function connectDB() {
  const connUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/complaint_portal';
  try {
    const conn = await mongoose.connect(connUri, {
      serverSelectionTimeoutMS: 2000,
    });
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.warn(`[Database Warning] Could not connect to MongoDB at ${connUri}: ${error.message}`);
    console.warn(`[Database Warning] Falling back to Memory Data Store mode.`);
    mongoose.set('bufferCommands', false);
    return null;
  }
}
