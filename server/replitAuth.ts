import type { Express, RequestHandler } from "express";

const disableAuth =
  !process.env.REPLIT_DOMAINS ||
  !process.env.REPL_ID ||
  !process.env.SESSION_SECRET;

if (disableAuth) {
  console.warn("⚠️ Replit Auth disabled — missing REPLIT_DOMAINS / REPL_ID / SESSION_SECRET.");
}

// === DUMMY FALLBACKS FOR DEV ===
let setupAuth: (app: Express) => Promise<void> | void = (_app: Express) => {};
let isAuthenticated: RequestHandler = (_req, _res, next) => next();

if (!disableAuth) {
  // ✅ Only import heavy dependencies when needed
  const client = await import("openid-client");
  const { Strategy } = await import("openid-client/passport");
  const passport = (await import("passport")).default;
  const session = (await import("express-session")).default;
  const memoize = (await import("memoizee")).default;
  const connectPg = (await import("connect-pg-simple")).default;
  const { storage } = await import("./storage");

  const getOidcConfig = memoize(async () => {
    return await client.discovery(
      new URL(process.env.ISSUER_URL ?? "https://replit.com/oidc"),
      process.env.REPL_ID!
    );
  }, { maxAge: 3600 * 1000 });

  function updateUserSession(
    user: any,
    tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers
  ) {
    user.claims = tokens.claims();
    user.access_token = tokens.access_token;
    user.refresh_token = tokens.refresh_token;
    user.expires_at = user.claims?.exp;
  }

  async function upsertUser(claims: any) {
    await storage.upsertUser({
      id: claims["sub"],
      email: claims["email"],
      firstName: claims["first_name"],
      lastName: claims["last_name"],
      profileImageUrl: claims["profile_image_url"],
    });
  }

  function getSession() {
    const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
    const pgStore = connectPg(session);
    const sessionStore = new pgStore({
      conString: process.env.DATABASE_URL,
      createTableIfMissing: false,
      ttl: sessionTtl,
      tableName: "sessions",
    });

    return session({
      secret: process.env.SESSION_SECRET!,
      store: sessionStore,
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: true,
        maxAge: sessionTtl,
      },
    });
  }

  setupAuth = async (app: Express) => {
    app.set("trust proxy", 1);
    app.use(getSession());
    app.use(passport.initialize());
    app.use(passport.session());

    const config = await getOidcConfig();

    const verify = async (
      tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers,
      verified: (err: any, user?: Express.User) => void
    ) => {
      const user = {};
      updateUserSession(user, tokens);
      await upsertUser(tokens.claims());
      verified(null, user);
    };

    for (const domain of process.env.REPLIT_DOMAINS!.split(",")) {
      const strategy = new Strategy(
        {
          name: `replitauth:${domain}`,
          config,
          scope: "openid email profile offline_access",
          callbackURL: `https://${domain}/api/callback`,
        },
        verify
      );
      passport.use(strategy);
    }

    passport.serializeUser((user: Express.User, cb) => cb(null, user));
    passport.deserializeUser((user: Express.User, cb) => cb(null, user));

    app.get("/api/login", (req, res, next) => {
      passport.authenticate(`replitauth:${req.hostname}`, {
        prompt: "login consent",
        scope: ["openid", "email", "profile", "offline_access"],
      })(req, res, next);
    });

    app.get("/api/callback", (req, res, next) => {
      passport.authenticate(`replitauth:${req.hostname}`, {
        successReturnToOrRedirect: "/",
        failureRedirect: "/api/login",
      })(req, res, next);
    });

    app.get("/api/logout", (req, res) => {
      req.logout(() => {
        res.redirect(
          client.buildEndSessionUrl(config, {
            client_id: process.env.REPL_ID!,
            post_logout_redirect_uri: `${req.protocol}://${req.hostname}`,
          }).href
        );
      });
    });
  };

  isAuthenticated = async (req, res, next) => {
    const user = req.user as any;

    if (!req.isAuthenticated?.() || !user?.expires_at) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const now = Math.floor(Date.now() / 1000);
    if (now <= user.expires_at) {
      return next();
    }

    const refreshToken = user.refresh_token;
    if (!refreshToken) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const config = await getOidcConfig();
      const tokenResponse = await client.refreshTokenGrant(config, refreshToken);
      updateUserSession(user, tokenResponse);
      return next();
    } catch {
      return res.status(401).json({ message: "Unauthorized" });
    }
  };
}

export { setupAuth, isAuthenticated };
