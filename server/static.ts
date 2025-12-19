import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// This block handles BOTH modern ESM and older CommonJS bundled by Render
let __dirname;
try {
  const __filename = fileURLToPath(import.meta.url);
  __dirname = path.dirname(__filename);
} catch (e) {
  // Fallback if import.meta is not available (CommonJS/Bundled)
  __dirname = process.cwd();
}

export function serveStatic(app: Express) {
  // On Render, the built frontend is usually in 'dist/public'
  // We check multiple locations to be absolutely sure
  const pathsToTry = [
    path.resolve(__dirname, "..", "public"),
    path.resolve(__dirname, "public"),
    path.resolve(process.cwd(), "dist", "public"),
    path.resolve(process.cwd(), "public"),
  ];

  const distPath = pathsToTry.find((p) => fs.existsSync(p));

  if (!distPath) {
    throw new Error(
      `Could not find build directory. Checked: ${pathsToTry.join(", ")}`
    );
  }

  app.use(express.static(distPath));

  // Fall through to index.html for React Router support
  app.get("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
