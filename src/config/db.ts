import mongoose from "mongoose";

export const connectDB = async (): Promise<void> => {
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.DB_NAME;

  if (!uri) {
    throw new Error("MONGODB_URI is not defined in environment variables");
  }
  if (!dbName) {
    throw new Error("DB_NAME is not defined in environment variables");
  }

  try {
    const conn = await mongoose.connect(uri, { dbName });
    console.log(
      `MongoDB connected: ${conn.connection.host} | database: ${conn.connection.name}`
    );
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    process.exit(1);
  }
};
