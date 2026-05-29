import { neon, Pool } from "@neondatabase/serverless";

if (!process.env.NEON_URL) {
  throw new Error("NEON_URL is not defined");
}

export const sql = neon(process.env.NEON_URL);

export const pool = new Pool({
  connectionString: process.env.NEON_URL,
});