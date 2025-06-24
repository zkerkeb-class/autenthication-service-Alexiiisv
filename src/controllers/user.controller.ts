import { Request, Response } from "express";

export function getProfile(req: Request, res: Response) {
  if (!req.isAuthenticated()) return res.redirect("/");
  res.json(req.user);
} 