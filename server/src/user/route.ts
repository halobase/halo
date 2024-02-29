import { OpenAPIHono } from "@hono/zod-openapi";
import { $get } from "./$";
import { surreal } from "@lib/surreal";
import { User } from "@lib/types";

const app = new OpenAPIHono();

app.openapi($get, async (ctx) => {
  const auth = ctx.get("auth");  
  const [user] = await surreal.select<User>(auth.user.id, auth.token);  
  return ctx.json(user);
});

export default app;
