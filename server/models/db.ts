import { Pool } from "pg";
const DB_URL = process.env.DB_URL;
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
