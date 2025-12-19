import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Bulletproof __dirname for ESM and CJS
let __dirname: string;
try {
  // We check if import.meta exists before calling fileURLToPath
  // @ts-ignore
  if (import.meta && import.meta.url) {
    const __filename = fileURLToPath(import.meta.url);
    __dirname = path.dirname(__filename);
  } else {
    __dirname = process.cwd();
  }
} catch (e) {
  __dirname = process.cwd();
}

export function serveStatic(app: Express) {
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

  app.get("*", (_req, res) => {
    // We use distPath! (with exclamation) to tell TS it's definitely defined
    res.sendFile(path.resolve(distPath!, "index.html"));
  });
}
