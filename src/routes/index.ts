import { Router } from "express";
import passport from "passport";
import { authCallback, logout } from "../controllers/auth.controller";
import { getProfile } from "../controllers/user.controller";
import { healthCheck } from "../controllers/health.controller";

const router = Router();

// Auth routes
router.get(
  "/auth",
  passport.authenticate("openidconnect", {
    scope: ["openid", "profile", "email"],
  })
);

router.get(
  "/auth/callback",
  passport.authenticate("openidconnect", { failureRedirect: "/" }),
  authCallback
);

router.get("/logout", logout);

// User route
router.get("/profile", getProfile);

// Health check
router.get("/health", healthCheck);

export default router; 