import { OpenAPIHono } from "@hono/zod-openapi";
import { $delete, $list, $post } from "./$";
import { surreal } from "@lib/surreal";
import { Key, User } from "@lib/types";
import { digest, hexify } from "@lib/encoding";
import env from "@lib/env";
import { Jwt } from "hono/utils/jwt";
import { DAY } from "@lib/time";

const app = new OpenAPIHono();

app.openapi($list, async (ctx) => {
  const auth = ctx.get("auth");
  const keys = await surreal.select<Key>("key", auth.token);
  return ctx.json(keys);
});

app.openapi($post, async (ctx) => {
  
  const auth = ctx.get("auth");
  const init = ctx.req.valid("json");
  console.log(init);
  const lives = init.lives;
  const scopes = init.scopes;
  const prefix = "sk";
  const seed = crypto.randomUUID();
  const secret = hexify(await digest("sha-1", seed));
  const secret_truncated = secret.slice(-4);
  const token_surrealdb = await persistant_token(auth.user);
  console.log(token_surrealdb);
  
  const [[key]] = await surreal.query<[Key]>(
    `begin;
      let $keys = (create key content {lives: $init.lives, scopes: $init.scopes, prefix: $init.prefix, secret_truncated: $init.secret_truncated, secret: crypto::argon2::generate($init.secret)});
      create k2t content {key: $keys[0].id, token: $token_surrealdb};
      return $keys;
     commit;
    `,
    {
      init: {
        ...init,
        lives,
        scopes,
        prefix,
        secret,
        secret_truncated
      },
      token_surrealdb
    },
    auth.token
  );
  key.key_onetime = `${prefix}-${key.id.slice("key:".length)}-${secret}`;
  return ctx.json(key);
});

app.openapi($delete, async (ctx) => {  
  const auth = ctx.get("auth");
  const { id } = ctx.req.valid("param");
  await surreal.delete(id,auth.token);
  return ctx.newResponse(null, 200);
});

async function persistant_token(user: User) {
  const expiry = Date.now() + 356 * 100 * DAY; // 100 years is enough :)
  return Jwt.sign(
    {
      iss: "halo.dev",
      exp: Math.floor(expiry / 1000),
      user,
      ns: env.SURREAL_NS,
      db: env.SURREAL_DB,
      sc: user.scope ?? "user",
      tk: "user"
    },
    env.TOKEN_SECRET!
  );
}

export default app;

/*
  ## References
  - https://medium.com/procedureflow-engineering/building-api-authentication-at-procedureflow-4d1fe78bb293
 */
