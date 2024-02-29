import { OpenAPIHono } from "@hono/zod-openapi";
import { $create, $create_presigned_url, $delete } from "./$";
import env from "@lib/env";
import { cos } from "@lib/cos";
import { surreal } from "@lib/surreal";
import { File } from "@lib/types";

const app = new OpenAPIHono();

app.openapi($create_presigned_url, async (ctx) => {
  const auth = ctx.get("auth");
  const init = ctx.req.valid("json");
  const object_key = `${auth.user.id}/${init.name}`;
  const url = cos.getObjectUrl({
    Region: env.COS_REGION!,
    Bucket: env.COS_BUCKET!,
    Method: init.method,
    Key: object_key,
    Expires: 3600,  // 1 hour
    Sign: true,
  }, (err, data) => { });
  return ctx.json({ object_key, url });
});

app.openapi($create, async (ctx) => {
  const auth = ctx.get("auth");
  const init = ctx.req.valid("json");
  const pre_signed_url = cos.getObjectUrl({
    Region: env.COS_REGION!,
    Bucket: env.COS_BUCKET!,
    Method: "GET",
    Key: init.object_key,
    Expires: 604800,  // 7 days
    Sign: true,
  }, (err, data) => { });
  const [file] = await surreal.create<File>(
    "file",
    { ...init, pre_signed_url },
    auth.token,
  );
  return ctx.json(file);
});

app.openapi($delete, async (ctx) => {
  const auth = ctx.get("auth");
  const { id } = ctx.req.param();
  const [file] = await surreal.delete(id, auth.token);
  return ctx.json(file);
});

export default app;