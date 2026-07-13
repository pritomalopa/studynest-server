import dotenv from "dotenv";
dotenv.config();

import app from "../src/app";
import { connectDB } from "../src/config/db";
import mongoose from "mongoose";

// Vercel serverless functions reuse warm containers — only reconnect if not already connected
let isConnected = false;

const handler = async (req: any, res: any) => {
  if (!isConnected || mongoose.connection.readyState !== 1) {
    await connectDB();
    isConnected = true;
  }
  return app(req, res);
};

export default handler;
