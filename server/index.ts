import 'dotenv/config';
import express, { type Request, Response, NextFunction } from "express";
import cors from "cors";
import { setupAuth, isAuthenticated } from "./googleAuth";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

console.log("✅ DATABASE_URL:", process.env.DATABASE_URL);
console.log("✅ GEMINI_API_KEY:", process.env.GEMINI_API_KEY);
console.log("✅ .env loaded | GOOGLE_CLIENT_ID:", process.env.GOOGLE_CLIENT_ID);

const app = express(); // ✅ Initialize express first

const allowedOrigins = [
  "http://localhost:5173",
  "https://expencesplitpro.netlify.app", // ✅ Update if frontend domain changes
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// ✅ Logging Middleware
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }
      log(logLine);
    }
  });

  next();
});

// ✅ Server Boot Function (Avoid top-level await for esbuild)
async function startServer() {
  await setupAuth(app);

  app.get("/api/protected", isAuthenticated, (req, res) => {
    res.send("Secret Data");
  });

  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    console.error("❌ Server Error:", err);
  });

  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const port = process.env.PORT || 5001;
  server.listen({ port, host: "0.0.0.0", reusePort: true }, () => {
    log(`✅ Server running on port ${port}`);
  });
}

// ✅ Start the server
startServer().catch((err) => {
  console.error("❌ Failed to start server:", err);
});
