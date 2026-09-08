import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { defineConfig } from "cypress";

function loadEnvFile(filePath: string) {
  if (!existsSync(filePath)) return;
  for (const line of readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const separator = trimmed.indexOf("=");
    if (separator <= 0) continue;
    const key = trimmed.slice(0, separator).trim();
    let value = trimmed.slice(separator + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

loadEnvFile(resolve(__dirname, ".env.local"));
loadEnvFile(resolve(__dirname, ".env"));

export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:3001",
    specPattern: "cypress/e2e/**/*.cy.{js,ts}",
    supportFile: "cypress/support/e2e.ts",
    defaultCommandTimeout: 15000,
    requestTimeout: 20000,
    responseTimeout: 30000,
    video: false,
    env: {
      loginEmail:
        process.env.CYPRESS_LOGIN_EMAIL ??
        process.env.NEXT_PUBLIC_DEV_LOGIN_EMAIL ??
        "",
      loginPassword:
        process.env.CYPRESS_LOGIN_PASSWORD ??
        process.env.NEXT_PUBLIC_DEV_LOGIN_PASSWORD ??
        "",
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
      supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "",
      apiUrl: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000",
    },
  },
});
