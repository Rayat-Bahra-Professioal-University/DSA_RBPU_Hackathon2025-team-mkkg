import mongoose from "mongoose";

export async function connectDB(uri) {
  if (!uri) {
    console.warn("⚠ MONGO_URI not set, skipping MongoDB connection");
    console.warn("  Add your MongoDB connection string to backend/.env");
    return false;
  }

  try {
    // Remove deprecated options - they're not needed in modern versions
    await mongoose.connect(uri);
    console.log("✓ MongoDB connected successfully");
    return true;
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    console.error("\n💡 Common fixes:");
    console.error("  1. Check your MongoDB URI in backend/.env");
    console.error("  2. Verify username and password are correct");
    console.error("  3. Make sure your IP is whitelisted in MongoDB Atlas");
    console.error("  4. Check if database name is specified in the URI");
    console.error("\n📖 See SETUP_GUIDE.md for help\n");
    return false;
  }
}

export function isMongooseConnected() {
  return mongoose.connection && mongoose.connection.readyState === 1;
}
