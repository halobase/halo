import { OpenAPIHono } from "@hono/zod-openapi";
import { $create, $create_message, $delete, $get, $list, $list_massages, $update } from "./$";
import { surreal } from "@lib/surreal";
import { Chat, Message } from "@lib/types";

const app = new OpenAPIHono();

app.openapi($list, async (ctx) => {
  const auth = ctx.get("auth");
  const { assistant } = ctx.req.query();
  if (assistant) {
    const [chats] = await surreal.query<Chat[]>(
      `select * from chat where assistant = $assistant order by created_at desc`,
      { assistant },
      auth.token,
    );
    return ctx.json(chats);
  }
  const chats = await surreal.select<Chat>("chat", auth.token);
  return ctx.json(chats);
});

app.openapi($create, async (ctx) => {
  const auth = ctx.get("auth");
  const init = ctx.req.valid("json");
  const [chat] = await surreal.create<Chat>("chat", init, auth.token);
  return ctx.json(chat);
});

app.openapi($get, async (ctx) => {
  const auth = ctx.get("auth");
  const { id } = ctx.req.param();
  const [chat] = await surreal.select<Chat>(id, auth.token);
  return ctx.json(chat);
});

app.openapi($update, async (ctx) => {
  const auth = ctx.get("auth");
  const { id } = ctx.req.param();
  const init = ctx.req.valid("json");
  const [chat] = await surreal.update<Chat>(id, init, auth.token);
  return ctx.json(chat);
});

app.openapi($delete, async (ctx) => {
  const auth = ctx.get("auth");
  const { id } = ctx.req.param();
  const [chat] = await surreal.delete<Chat>(id, auth.token);
  return ctx.json(chat);
});

app.openapi($create_message, async (ctx) => {
  const auth = ctx.get("auth");
  const { id } = ctx.req.param();
  const init = ctx.req.valid("json");
  const [msg] = await surreal.create<Message>(
    "msg",
    { ...init, chat: id },
    auth.token
  );
  return ctx.json(msg);
});

app.openapi($list_massages, async (ctx) => {
  const auth = ctx.get("auth");
  const { id } = ctx.req.param();
  const [msgs] = await surreal.query(
    `select * from msg where chat = $chat order by created_at asc`,
    { chat: id },
    auth.token,
  );  
  return ctx.json(msgs);
});

export default app;
