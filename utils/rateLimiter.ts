import { client } from "./redis.js";
import type { NextFunction, Request, Response } from "express";
interface RateLimiterRule {
  endpoint: string;
  rateLimit: {
    time: number;
    limit: number;
  };
}

export const rateLimiter = (rule: RateLimiterRule) => {
  const { endpoint, rateLimit } = rule;
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const ipAddress = req.ip;
      const redisId = `rate:${endpoint}/${ipAddress}`;

      const requests = await client.incr(redisId);

      if (requests === 1) {
        await client.expire(redisId, rateLimit.time);
      }
      if (requests > rateLimit.limit) {
        return res.status(429).send({
          message: "too much request",
        });
      }
      next();
    } catch (error) {
      console.error("Rate limiter error:", error);
      next();
    }
  };
};
