import { Context, MiddlewareHandler } from "hono";
import { getCookie } from "hono/cookie";
import { HTTPException } from "hono/http-exception";
import { Jwt } from "hono/utils/jwt";
import { AlgorithmTypes } from "hono/utils/jwt/types";
import { Auth, User } from "./types";

declare module "hono" {
  interface ContextVariableMap {
    auth: Auth,
  }
}

type Options = {
  secret: string | ((ctx: Context) => Promise<string>),
  cookie?: string,
  apikey?: string,
  alg?: AlgorithmTypes,
};

export function auth(opts: Options): MiddlewareHandler {

  if (!crypto.subtle || !crypto.subtle.importKey) {
    throw new Error("auth: `crypto.subtle.importKey` is undefined in the environment.");
  }

  return async function (ctx, next) {
    const creds = ctx.req.header("Authorization");
    
    let token;
    if (creds) {
      const parts = creds.split(/\s+/);
      if (parts.length !== 2) {
        throw new HTTPException(401, {
          res: unauthorized(ctx, "Bad credentials structure."),
        });
      } else {
        token = parts[1];
      }
    } else if (opts.cookie) {
      token = getCookie(ctx, opts.cookie);
    } else if (opts.apikey) {
      // TODO: exchange token with apikey
    }
    
    if (!token) {
      throw new HTTPException(401, {
        res: unauthorized(ctx, "No credentials found in request"),
      });
    }

    const secret = typeof opts.secret === "string"
      ? opts.secret : await opts.secret(ctx);

    let claims;
    try {
      claims = await Jwt.verify(token, secret, opts.alg);
    } catch (e) {
      throw new HTTPException(401, {
        res: unauthorized(ctx, "Token verification failed."),
      });
    }
    ctx.set("auth", {
      user: claims.user as User,
      token,
    });
    await next();
  }
}

function unauthorized(ctx: Context, message: string) {
  return Response.json(
    {
      message,
    },
    {
      status: 401,
      headers: {
        "content-type": "application/json",
        "www-authenticate": `Bearer realm="${ctx.req.url},error=${message}"`
      }
    }
  );
}