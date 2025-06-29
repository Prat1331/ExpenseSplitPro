import type { Express, RequestHandler } from "express";
import passport from "passport";
import session from "express-session";
import { Strategy as GoogleStrategy, Profile } from "passport-google-oauth20";

const SESSION_SECRET = process.env.SESSION_SECRET!;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;
const CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL!;

interface AuthenticatedUser {
  sub: string;
  name: string;
  email: string;
  photo?: string;
}

export function setupAuth(app: Express) {
  app.use(
    session({
      secret: SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
    })
  );

  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new GoogleStrategy(
      {
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: CALLBACK_URL,
      },
      (accessToken, refreshToken, profile: Profile, done) => {
        // ✅ Structure the user object for session
        const user: AuthenticatedUser = {
          sub: profile.id,
          name: profile.displayName,
          email: profile.emails?.[0]?.value || "",
          photo: profile.photos?.[0]?.value,
        };
        done(null, user);
      }
    )
  );

  passport.serializeUser((user, done) => {
    done(null, user);
  });

  passport.deserializeUser((obj: AuthenticatedUser, done) => {
    done(null, obj);
  });

  // 🔐 Google Login
  app.get("/api/login", passport.authenticate("google", { scope: ["profile", "email"] }));

  // 🔄 Google OAuth Callback
  app.get(
    "/api/callback",
    passport.authenticate("google", { failureRedirect: "/api/login" }),
    (req, res) => {
      // ✅ Redirect to frontend home/dashboard after successful login
      res.redirect("http://localhost:5173"); // change to your frontend's port or domain
    }
  );

  // 🚪 Logout
  app.get("/api/logout", (req, res) => {
    req.logout(() => res.redirect("/"));
  });

  // 👤 Get Authenticated User
  app.get("/api/auth/user", (req, res) => {
    if (!req.isAuthenticated?.() || !req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = req.user as AuthenticatedUser;
    res.json({
      name: user.name,
      email: user.email,
      photo: user.photo,
      sub: user.sub,
    });
  });
}

// 🔒 Auth Middleware
export const isAuthenticated: RequestHandler = (req, res, next) => {
  const user = req.user as AuthenticatedUser;
  if (req.isAuthenticated?.() && user?.sub) return next();
  res.status(401).json({ message: "Unauthorized" });
};
