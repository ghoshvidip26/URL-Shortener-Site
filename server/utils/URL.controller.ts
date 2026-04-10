import { query } from "../models/db.js";
const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

function generateCode(length = 6) {
  let code = "";
  for (let i = 0; i < length; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export const shortenURL = async (req: any, res: any) => {
  try {
    const { originalURL } = req.body;
    if (!originalURL || !originalURL.startsWith("http")) {
      return res.status(400).json({ error: "Invalid URL" });
    }
    const baseUrl = `${req.protocol}://${req.get("host")}`;
    let code;
    let inserted = false;

    while (!inserted) {
      try {
        code = generateCode();
        await query("INSERT INTO urls (shortCode,originalUrl) VALUES ($1,$2)", [
          code,
          originalURL,
        ]);

        inserted = true;
      } catch (error) {
        console.log("Error: ", error);
      }
    }

    return res.json({
      shortUrl: `${baseUrl}/${code}`,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
