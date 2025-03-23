import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import authRoute from "./routes/auth.routes.js";
import postRoute from "./routes/post.routes.js";
import profileRoute from "./routes/profile.routes.js";
import db from "./conf/database.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware setup
app.use(cookieParser());
app.use(express.json());

// CORS setup
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'https://echowrite.lavishmathur.xyz' ,
    credentials: true,
  })
);
app.use((req, res, next) => {
  const allowedOrigins = [
    process.env.FRONTEND_URL,
    "https://accounts.google.com", 
    "https://firebaseapp.com",
    "https://*.firebaseapp.com", 
  ];

  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
  }

  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});


// Routes
app.use("/api/auth", authRoute);
app.use("/api/posts", postRoute);
app.use("/api/profile", profileRoute);

// Home route
app.get("/", (req, res) => {
  res.send("Server running");
});

// Database connection and server start
(async () => {
  try {
    // Test database connection with a simple query
    await db.raw("SELECT 1");
    console.log("Database connected successfully");

    app.listen(PORT, () => {
      console.log(`Server running on port: ${PORT}`);
    });
  } catch (error) {
    console.error("Database connection failed :: ", error);
    setTimeout(() => process.exit(1), 5000);
  }
})();
