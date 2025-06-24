import express from "express";
import session from "express-session";
import passport from "passport";
import { configurePassport } from "./config/passport";
import { PORT } from "./config/env";
import routes from "./routes/index";

const app = express();

// Pour obtenir la vraie IP derrière un proxy (x-forwarded-for)
app.set('trust proxy', true);

// Middleware de session
app.use(session({ secret: "secret", resave: false, saveUninitialized: true }));

// Initialisation de Passport
configurePassport();
app.use(passport.initialize());
app.use(passport.session());

// Utilisation des routes
app.use(routes);

app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
