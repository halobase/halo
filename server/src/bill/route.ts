import { Hono } from 'hono'
import { surreal } from "@lib/surreal";
import { Bill,Key } from "@lib/types";
const app = new Hono()

app.get('/personal',async (ctx) => {
  const auth = ctx.get("auth");
  const userId = auth.user.id;
  const [bills] = await surreal.query<Bill[]>(
    `
    select * from bill where user = $userId
    `,
    {userId} ,
    auth.token);
  return ctx.json(bills);
});
export default app;