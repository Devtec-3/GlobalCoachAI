import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";

// ⬇️ ADD THIS LINE to load your .env variables
dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is missing from .env file");
}

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});
