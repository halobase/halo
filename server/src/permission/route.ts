import { Hono } from 'hono'
import { surreal } from "@lib/surreal";
import { Applylog,User } from "@lib/types";
const app = new Hono()
app.get('/examine',async (ctx) => {
  const auth = ctx.get("auth");
  const [applylog] = await surreal.query<Applylog[]>(
    `select * from applylog where  state = "pending"`,
    {},
    auth.token)
  return ctx.json(applylog); 
});
app.post('/apply',async (ctx) => {
  const auth = ctx.get("auth");
  const init =  await ctx.req.json()

  const [applylog] = await surreal.create<Applylog>("applylog", {service:init.permission,user:auth.user.id},auth.token);
  return ctx.json(applylog); 
});
app.get('/state',async (ctx) => {
  const auth = ctx.get("auth");
  const [[applylog]] = await surreal.query<Applylog[]>(
    `select * from applylog where user = $id and state = "pending"`,
    { 
      id:auth.user.id ,
    },
    auth.token)
  return ctx.json(applylog||{}); 
});
app.put('/approve',async (ctx) => {
  const auth = ctx.get("auth"); 
  const init =  await ctx.req.json();
  console.log(init.applylog);
  
  if(init.applylog){
    await surreal.query<Applylog>(
      `update applylog set state = "finish" where user = $id`,
      {
        id:init.userId,
      },
      auth.token)
  }
  const permission = init?.permission;
  await surreal.update<User>(init.userId, { permission }, auth.token);
  const users = await surreal.select<User>("user",auth.token);
  return ctx.json(users)
});
export default app;