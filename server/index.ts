import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";
import { pool } from "./db";
import "dotenv/config";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const app = express();

// --- 🛡️ RENDER PROXY TRUST ---
// This tells Express to trust the headers Render's proxy (load balancer) sends.
// Without this, 'secure: true' cookies will be rejected.
app.set("trust proxy", 1);

console.log("-----------------------------------------");
console.log("🚀 BOOTSTRAP: Environment Health Check");
console.log("PORT Configured:", process.env.PORT || "5000 (Default)");
console.log("Database Connected:", !!process.env.DATABASE_URL);
console.log("Gemini AI Key Active:", !!process.env.GEMINI_API_KEY);
console.log("-----------------------------------------");

const httpServer = createServer(app);

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

declare module "express-session" {
  interface SessionData {
    userId: string;
  }
}

app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  })
);

app.use(express.urlencoded({ extended: false }));

const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret && process.env.NODE_ENV === "production") {
  throw new Error(
    "SESSION_SECRET environment variable is required in production"
  );
}

const PgSession = connectPgSimple(session);
app.use(
  session({
    store: new PgSession({
      pool: pool,
      tableName: "session",
      createTableIfMissing: true,
    }),
    secret: sessionSecret || "dev-only-secret-not-for-production",
    resave: false,
    saveUninitialized: false,
    name: "globalcoach_session", // Custom name to avoid collision
    cookie: {
      maxAge: 30 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      // On Render, this must be true for secure logins
      secure: process.env.NODE_ENV === "production",
      // 'lax' is best for standard same-domain hosting like Render
      sameSite: process.env.NODE_ENV === "production" ? "lax" : "lax",
    },
  })
);

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

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
      log(logLine);
    }
  });
  next();
});

(async () => {
  await registerRoutes(httpServer, app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
  });

  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  } else {
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
  }

  // Ensure we use the PORT provided by Render
  const PORT = Number(process.env.PORT) || 5000;
  httpServer.listen(PORT, "0.0.0.0", () => {
    log(`🚀 Server is active at http://0.0.0.0:${PORT}`);
  });
})();
