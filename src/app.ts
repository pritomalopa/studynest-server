import express, { Application } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import mongoSanitize from "express-mongo-sanitize";

import authRoutes from "./routes/authRoutes";
import resourceRoutes from "./routes/resourceRoutes";
import studyGroupRoutes from "./routes/studyGroupRoutes";
import tutorRoutes from "./routes/tutorRoutes";
import adminRoutes from "./routes/adminRoutes";
import { notFound, errorHandler } from "./middleware/errorHandler";

const app: Application = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(helmet());
app.use(express.json());
app.use(mongoSanitize());
app.use(cookieParser());

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many authentication attempts. Please try again in 15 minutes.",
  },
});

app.get("/", (_req, res) => {
  res.json({ message: "StudyNest API is running." });
});
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/resources", resourceRoutes);
app.use("/api/study-groups", studyGroupRoutes);
app.use("/api/tutors", tutorRoutes);
app.use("/api/admin", adminRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
