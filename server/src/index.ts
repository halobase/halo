import { OpenAPIHono } from "@hono/zod-openapi";
import { auth } from "@lib/auth";
import { $zen } from "./$";
import { logger } from "hono/logger";
import { cors } from "hono/cors";
import { HTTPException } from "hono/http-exception";
import env from "@lib/env";
import iam from "./iam/route";
import user from "./user/route";
import keys from "./keys/route";
import services from "./services/route";
import assistants from "./asses/route";
import chats from "./chats/route";
import files from "./files/route";

const version = "1.0.0";

const app = new OpenAPIHono({
  defaultHook: (r, ctx) => {
    if (!r.success) {
      return ctx.json({
        message: r.error.toString()
      }, 400);
    }
  }
});

app.onError((e, ctx) => {
  console.error(e);
  return e instanceof HTTPException
    ? e.getResponse()
    : ctx.newResponse(e.message, 500);
});

app.use("/*", logger(), cors());

// @ts-ignore
app.openapi($zen, (ctx) => {
  return ctx.text(`
 _  _      _     
| || |__ _| |___
| __ / _\` | / _ \\
|_||_\\__,_|_\\___/    v${version}
 
 Have fun :)

` );
});

app.doc("/schema", (ctx) => ({
  openapi: "3.0.3",
  info: {
    title: "HaloZ",
    version,
    description: `
`
  },
  servers: [{
    url: new URL(ctx.req.url).origin,
  }]
}));


app.route("/iam", iam);

app.use("/*", auth({
  cookie: "hz-token",
  secret: async (ctx) => env.TOKEN_SECRET!,
}));

app.route("/user", user);
app.route("/keys", keys);
app.route("/services", services);
app.route("/assistants", assistants);
app.route("/chats", chats);
app.route("/files", files);

export default app;
