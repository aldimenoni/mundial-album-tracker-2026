import { execSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "dotenv";

const apiDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

config({ path: path.resolve(apiDir, "../../.env"), quiet: true });
config({ path: path.resolve(apiDir, ".env"), override: true, quiet: true });

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL no está definida. Creá .env en la raíz del repo (mirá .env.example).");
  process.exit(1);
}

execSync("prisma migrate deploy", {
  cwd: apiDir,
  stdio: "inherit",
  env: process.env
});
