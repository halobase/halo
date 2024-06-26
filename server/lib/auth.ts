import { Context, MiddlewareHandler } from "hono";
import { getCookie } from "hono/cookie";
import { HTTPException } from "hono/http-exception";
import { Jwt } from "hono/utils/jwt";
import { AlgorithmTypes } from "hono/utils/jwt/types";
import { Auth, K2T, User } from "./types";
import { surreal } from "./surreal";

declare module "hono" {
  interface ContextVariableMap {
    auth: Auth;
  }
}

type Options = {
  secret: string | ((ctx: Context) => Promise<string>);
  cookie?: string;
  apikey?: string;
  alg?: AlgorithmTypes;
};

export function auth(opts: Options): MiddlewareHandler {
  if (!crypto.subtle || !crypto.subtle.importKey) {
    throw new Error(
      "auth: `crypto.subtle.importKey` is undefined in the environment."
    );
  }

  return async function (ctx, next) {
    const creds = ctx.req.header("Authorization");
    let token;
    if (creds) {
      const parts = creds.split(/\s+/);
      if (parts.length !== 2) {
        throw new HTTPException(401, {
          res: unauthorized(ctx, "Bad credentials structure.")
        });
      } else {
        token = parts[1];
      }
    }

    if (!token && opts.cookie) {
      token = getCookie(ctx, opts.cookie);
    }

    if (!token && opts.apikey) {
      // exchange token with apikey
      token = await exchange(ctx, ctx.req.header(opts.apikey));
    }

    if (!token) {
      throw new HTTPException(401, {
        res: unauthorized(ctx, "No credentials found in request")
      });
    }

    const secret =
      typeof opts.secret === "string" ? opts.secret : await opts.secret(ctx);

    let claims;
    try {
      claims = await Jwt.verify(token, secret, opts.alg);
    } catch (e) {
      throw new HTTPException(401, {
        res: unauthorized(ctx, "Token verification failed.")
      });
    }
    ctx.set("auth", {
      user: claims.user as User,
      token
    });
    await next();
  };
}

async function exchange(ctx: Context, key?: string) {
  if (!key) return "";

  const slices = key.split("-");
  if (slices.length !== 3) {
    throw new HTTPException(401, {
      res: unauthorized(ctx, "Bad API Key")
    });
  }

  const [, [k2t]] = await surreal.query<[K2T]>(
    `begin;
    let $keys = select * from $key_id where crypto::argon2::compare(secret, $key_secret);
    if array::len($keys) > 0 {
        return select key.scopes, token from k2t where key = $keys[0].id fetch key;
    };
    commit;
    `,
    {
      key_id: `key:${slices[1]}`,
      key_secret: slices[2]
    }
  );
  // TODO: filter scopes via ctx
  return k2t?.token;
}

function unauthorized(ctx: Context, message: string) {
  return Response.json(
    {
      message
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
