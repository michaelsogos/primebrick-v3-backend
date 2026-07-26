/**
 * Express Request augmentation — adds `user` and `rawAccessToken` to Express.Request.
 *
 * The AuthUser type is imported from @primebrick/sdk (the single source of truth).
 * This file is a side-effect import: `import "./modules/auth/express-augmentation.js"`
 */

import type { AuthUser } from "@primebrick/sdk";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace -- Express type augmentation requires namespace Express (official @types/express pattern)
  namespace Express {
    interface Request {
      user?: AuthUser;
      /** Raw access token captured in STANDALONE mode for proxy forwarding. */
      rawAccessToken?: string;
    }
  }
}

export {};
