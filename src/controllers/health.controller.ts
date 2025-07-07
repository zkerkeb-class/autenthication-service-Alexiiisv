import { Request, Response, RequestHandler } from "express";

export const healthCheck: RequestHandler = (_req: Request, res: Response) => {
  res.json({ status: "OK", service: "notification-service" });
} 