import { OpenAPIHono } from "@hono/zod-openapi";
import { $delete, $list, $post } from "./$";
import { surreal } from "@lib/surreal";
import { Key } from "@lib/types";
import { digest, hexify } from "@lib/encoding";

const app = new OpenAPIHono();

app.openapi($list, async (ctx) => {
  const auth = ctx.get("auth");
  const keys = await surreal.select<Key>("key", auth.token);
  return ctx.json(keys);
});

app.openapi($post, async (ctx) => {
  const auth = ctx.get("auth");
  const init = ctx.req.valid("json");
  const prefix = "sk";
  const seed = crypto.randomUUID();
  const secret = hexify(await digest("sha-1", seed));
  const secret_truncated = secret.slice(-4);
  const [key] = await surreal.create<Key>(
    "key",
    {
      ...init,
      prefix,
      secret,
      secret_truncated,
    },
    auth.token,
  );
  key.key_onetime = `${prefix}-${key.id.slice("key:".length)}-${secret}`;
  return ctx.json(key);
});

app.openapi($delete, async (ctx) => {
  const auth = ctx.get("auth");
  const { id } = ctx.req.valid("param");
  await surreal.delete(id, auth.token);
  return ctx.newResponse(null, 200);
});

export default app;

/*
  ## References
  - https://medium.com/procedureflow-engineering/building-api-authentication-at-procedureflow-4d1fe78bb293
 */
