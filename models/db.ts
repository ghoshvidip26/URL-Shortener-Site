import { Pool } from "pg";
const DB_URL =
  "postgresql://neondb_owner:npg_D3eqRiJMy0aA@ep-odd-frog-anljuxzc-pooler.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";
const pool = new Pool({
  connectionString: DB_URL,
});

pool.on("connect", () => {
  console.log("Connected successfully");
});
pool.on("error", (err) => {
  console.error("Unexpected DB error: ", err);
});
export const query = (text: string, params?: any[]) => {
  console.log("QUERY: ", text);
  return pool.query(text, params);
};
