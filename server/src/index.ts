import { OpenAPIHono } from "@hono/zod-openapi";
import { stats } from "@lib/stats";
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
import assistants from "./assistants/route";
import files from "./files/route";
import  serviceslog  from "./serviceslog/route";

const version = "1.0.0";

const app = new OpenAPIHono({
  defaultHook: (r, ctx) => {
    if (!r.success) {
      return ctx.json(
        {
          message: r.error.toString()
        },
        400
      );
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

`);
});

app.doc("/schema", (ctx) => ({
  openapi: "3.0.3",
  info: {
    title: "Halo API",
    version,
    description: `
`
  },
  servers: [
    {
      url: "https://api.platform.archivemodel.cn"
    }
  ]
}));

app.openAPIRegistry.registerComponent("securitySchemes", "api_token", {
  type: "http",
  scheme: "bearer"
});

app.openAPIRegistry.registerComponent("securitySchemes", "api_key", {
  type: "apiKey",
  name: "X-API-Key",
  in: "header"
});

app.route("/iam", iam);

app.use(
  "/*",
  auth({
    apikey: "x-api-key",
    secret: async (ctx) => env.TOKEN_SECRET!
  }),
  stats()
);
app.route("/user", user);
app.route("/keys", keys);
app.route("/services", services);
app.route("/assistants", assistants);
app.route("/files", files);
app.route("/stats", serviceslog);

export default app;
