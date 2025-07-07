import { Request, Response, RequestHandler } from "express";

export const getProfile: RequestHandler = (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    res.redirect("/");
    return;
  }
  res.json(req.user);
} 