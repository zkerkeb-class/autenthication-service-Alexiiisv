import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import { GOOGLE_CLIENT_ID } from "../config/env";
const fetch = require("node-fetch");


export async function authCallback(req: Request, res: Response) {
  // Récupérer les infos du profil Google
  const user = req.user as any;
  const username = user?.displayName || user?.name || user?.emails?.[0]?.value?.split('@')[0] || "user";
  const email = user?.emails?.[0]?.value;
  const password = "Test12345!";

  // Appel à l'API bdd-service pour créer l'utilisateur
  if (username && email) {
    try {
      await fetch("http://localhost:3003/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password })
      });
      // On ignore volontairement la réponse (l'utilisateur existe peut-être déjà)
    } catch (err) {
      // On ignore l'erreur si l'utilisateur existe déjà
    }
  }

  // Génération du token JWT
  const token = jwt.sign(
    { username, email },
    process.env.JWT_SECRET || "default_secret",
    { expiresIn: "1h", audience: GOOGLE_CLIENT_ID }
  );

  // Renvoie le token dans la réponse JSON
  res.json({ token });
}

export function logout(req: Request, res: Response) {
  req.logout({}, () => {
    res.redirect("/");
  });
} 