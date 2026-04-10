import express from "express";
import { client } from "./utils/redis.js";
import { shortenURL } from "./utils/URL.controller.js";
import { query } from "./models/db.js";
import { rateLimiter } from "./utils/rateLimiter.js";

const app = express();

client.on("error", (err) => console.log("Redis client error", err));

app.use(express.urlencoded({ extended: false }));

app.post(
  "/short",
  rateLimiter({
    endpoint: "short",
    rateLimit: { time: 60, limit: 10 },
  }),
  shortenURL,
);

app.get(
  "/:code",
  rateLimiter({
    endpoint: "redirect",
    rateLimit: {
      time: 60,
      limit: 100,
    },
  }),
  async (req, res) => {
    try {
      const { code } = req.params;

      if (!code || typeof code !== "string") {
        return res.status(400).json({ error: "Invalid code" });
      }

      // 1. Check Redis
      const cached = await client.get(code);

      if (cached) {
        console.log("Cache hit");
        return res.redirect(cached);
      }
      console.log("Cache miss");

      // 2. Fetch from DB
      const result = await query(
        "SELECT originalUrl FROM urls WHERE shortCode=$1",
        [code],
      );
      if (!result.rows[0]) {
        return res.status(404).json({ error: "Not found" });
      }
      const originalUrl = result.rows[0].originalUrl;
      // 3. Store in Redis
      await client.setEx(code, 3600, originalUrl);

      // 4. Redirect
      return res.redirect(originalUrl);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Server error" });
    }
  },
);

app.listen(process.env.PORT || 5100);
