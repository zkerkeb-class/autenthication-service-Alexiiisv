import express from "express";
import session from "express-session";
import passport from "passport";
import {
  Strategy as OpenIDConnectStrategy,
  Profile,
  VerifyCallback,
} from "passport-openidconnect";
import { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, PORT } from "./config/env";

const app = express();

// Session middleware
app.use(session({ secret: "secret", resave: false, saveUninitialized: true }));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Configurer la stratégie OpenID Connect
interface OpenIDConnectStrategyOptions {
  issuer: string;
  authorizationURL: string;
  tokenURL: string;
  userInfoURL: string;
  clientID: string;
  clientSecret: string;
  callbackURL: string;
  scope: string[];
}

passport.use(
  new OpenIDConnectStrategy(
    {
      issuer: "https://accounts.google.com",
      authorizationURL: "https://accounts.google.com/o/oauth2/v2/auth",
      tokenURL: "https://oauth2.googleapis.com/token",
      userInfoURL: "https://openidconnect.googleapis.com/v1/userinfo",
      clientID: GOOGLE_CLIENT_ID!,
      clientSecret: GOOGLE_CLIENT_SECRET!,
      callbackURL: "http://localhost:3000/auth/callback",
      scope: ["openid", "profile", "email"],
    } as OpenIDConnectStrategyOptions,
    (issuer: string, profile: Profile, cb: VerifyCallback) => {
      return cb(null, profile);
    }
  )
);

// Sérialisation des utilisateurs
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj as Express.User));

// Routes d'authentification
app.get(
  "/auth",
  passport.authenticate("openidconnect", {
    scope: ["openid", "profile", "email"],
  })
);

app.get(
  "/auth/callback",
  passport.authenticate("openidconnect", { failureRedirect: "/" }),
  (req, res) => {
    res.redirect("/profile");
  }
);

app.get("/profile", (req, res) => {
  if (!req.isAuthenticated()) return res.redirect("/");
  res.json(req.user);
});

app.get("/logout", (req, res) => {
  req.logout({}, () => {
    res.redirect("/");
  });
});

app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);

// Ajout d'un commentaire pour tester le commit
