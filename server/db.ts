import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";
import dotenv from "dotenv";
import path from "path";

// 🛡️ Manually load the .env file from the project root
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  // We added a more helpful error message here
  throw new Error(
    "DATABASE_URL must be set. Please ensure you have a .env file in the project root folder."
  );
}

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const db = drizzle(pool, { schema });
