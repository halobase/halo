import { OpenAPIHono } from "@hono/zod-openapi";
import { $get } from "./$";
import { surreal } from "@lib/surreal";
import { User } from "@lib/types";

const app = new OpenAPIHono();

app.openapi($get, async (ctx) => {
  const auth = ctx.get("auth");
  const [user] = await surreal.select<User>(auth.user.id,auth.token);
  return ctx.json(user);
});
app.get('/users',async (ctx) =>{
  const auth = ctx.get("auth");
  const users = await surreal.select<User>("user",auth.token);
  return ctx.json(users);
});
export default app;
