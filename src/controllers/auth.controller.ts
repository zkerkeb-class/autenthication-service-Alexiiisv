import jwt from "jsonwebtoken";
import { Request, Response, RequestHandler } from "express";
import { GOOGLE_CLIENT_ID } from "../config/env";
const fetch = require("node-fetch");


export const authCallback: RequestHandler = async (req: Request, res: Response) => {
  // Récupérer les infos du profil Google
  const user = req.user as any;
  const username = user?.displayName || user?.name || user?.emails?.[0]?.value?.split('@')[0] || "user";
  const email = user?.emails?.[0]?.value;
  const password = "Test12345!";

  // Appel à l'API bdd-service pour créer l'utilisateur
  if (username && email) {
    try {
      let userId: number;
      let userData: any;
      let premium: boolean = false;

      // D'abord, essayer de récupérer l'utilisateur existant
      const searchResponse = await fetch(`http://localhost:3003/api/users/search?email=${encodeURIComponent(email)}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" }
      });

      if (searchResponse.ok) {
        const searchData = await searchResponse.json();
        
        if (searchData.data && searchData.data.length > 0) {
          // L'utilisateur existe déjà
          userData = searchData.data[0];
          console.log("🚀 ~ authCallback ~ userData:", userData)
          userId = userData.id;
          premium = userData.premium;
        } else {
          // L'utilisateur n'existe pas, le créer
          const createResponse = await fetch("http://localhost:3003/api/users", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, email, password })
          });
          
          if (!createResponse.ok) {
            throw new Error(`Failed to create user: ${createResponse.statusText}`);
          }

          const createData = await createResponse.json();
          userData = createData.data;
          userId = userData.id;
          console.log("Nouvel utilisateur créé:", userId);
        }
      } else {
        // Si la recherche échoue, essayer de créer l'utilisateur
        const createResponse = await fetch("http://localhost:3003/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, email, password })
        });
        
        if (!createResponse.ok) {
          throw new Error(`Failed to create user: ${createResponse.statusText}`);
        }

        const createData = await createResponse.json();
        userData = createData.data;
        userId = userData.id;
        console.log("Nouvel utilisateur créé (recherche échouée):", userId);
      }

      if (!userId) {
        throw new Error('User ID not found or returned');
      }
      
      // Génération du token JWT avec l'ID utilisateur
      const token = jwt.sign(
        { 
          username, 
          email, 
          userId,
          premium
        },
        process.env.JWT_SECRET || "default_secret",
        { expiresIn: "1h", audience: GOOGLE_CLIENT_ID }
      );

      // Redirection vers le frontend avec le token
      res.redirect(`http://localhost:3000/auth-callback?token=${token}`);
    } catch (err) {
      console.error("Erreur lors de l'authentification:", err);
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      res.redirect(`http://localhost:3000/auth-callback?error=Erreur lors de l'authentification: ${errorMessage}`);
    }
  } else {
    res.redirect(`http://localhost:3000/auth-callback?error=Informations utilisateur manquantes`);
  }
}

export const logout: RequestHandler = (req: Request, res: Response) => {
  req.logout({}, () => {
    res.redirect("/");
  });
}