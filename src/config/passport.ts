import passport from "passport";
import { Strategy as OpenIDConnectStrategy, Profile, VerifyCallback } from "passport-openidconnect";
import { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } from "./env";

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

export function configurePassport() {
  passport.use(
    new OpenIDConnectStrategy(
      {
        issuer: "https://accounts.google.com",
        authorizationURL: "https://accounts.google.com/o/oauth2/v2/auth",
        tokenURL: "https://oauth2.googleapis.com/token",
        userInfoURL: "https://openidconnect.googleapis.com/v1/userinfo",
        clientID: GOOGLE_CLIENT_ID!,
        clientSecret: GOOGLE_CLIENT_SECRET!,
        callbackURL: "http://localhost:3001/auth/callback",
        scope: ["openid", "profile", "email"],
      } as OpenIDConnectStrategyOptions,
      (_issuer: string, profile: Profile, cb: VerifyCallback) => {
        return cb(null, profile);
      }
    )
  );

  passport.serializeUser((user, done) => done(null, user));
  passport.deserializeUser((obj, done) => done(null, obj as Express.User));
}
