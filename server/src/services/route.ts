import { OpenAPIHono } from "@hono/zod-openapi";
import { OpenAPIObject } from "openapi3-ts/oas30";
import { surreal } from "@lib/surreal";
import { Node, Service } from "@lib/types";
import { $list, $post, $readme, $put_node, $schema, $list_nodes, $get, $delete, $update } from "./$";


const app = new OpenAPIHono();

// @ts-ignore
app.openapi($list, async (ctx) => {
  const auth = ctx.get("auth");
  const [services] = await surreal.query<Service[]>(
    `select * omit readme, schema.paths from service`,
    undefined,
    auth.token,
  );
  return ctx.json(services);
});

// @ts-ignore
app.openapi($get, async (ctx) => {
  const auth = ctx.get("auth");
  const { id } = ctx.req.valid("param");
  const [service] = await surreal.select<Service>(id, auth.token);
  return ctx.json(service);
});

app.openapi($schema, async (ctx) => {
  const auth = ctx.get("auth");
  const { id } = ctx.req.valid("param");
  const [[schema]] = await surreal.query<OpenAPIObject[]>(
    `select value schema from $id`,
    { id },
    auth.token,
  );
  return ctx.json(schema);
});

// @ts-ignore
app.openapi($readme, async (ctx) => {
  const auth = ctx.get("auth");
  const { id } = ctx.req.valid("param");
  const [[readme]] = await surreal.query<string[]>(
    `select value readme from $id`,
    { id },
    auth.token,
  );
  return ctx.text(readme);
});

app.openapi($post, async (ctx) => {
  const auth = ctx.get("auth");
  const init = ctx.req.valid("json");
  const [service] = await surreal.create<Service>("service", init, auth.token);
  return ctx.json(service);
});

// @ts-ignore
app.openapi($update, async (ctx) => {
  const auth = ctx.get("auth");
  const { id } = ctx.req.param();
  const init = ctx.req.valid("json");
  const [service] = await surreal.update<Service>(id, init, auth.token);
  return ctx.json(service);
});

app.openapi($delete, async (ctx) => {
  const auth = ctx.get("auth");
  const { id } = ctx.req.param();
  await surreal.delete(id, auth.token);
  return ctx.newResponse(null);
});

app.openapi($put_node, async (ctx) => {
  const auth = ctx.get("auth");
  const { id } = ctx.req.param();
  const init = ctx.req.valid("json");
  const node_id = init.id.startsWith("node:") ? init.id : `node:${init.id}`;
  init.id = node_id;
  const [[node]] = await surreal.query<Node[]>(
    `update $id merge $init`,
    {
      id: node_id,
      init: {
        ...init,
        service: id,
      }
    },
    auth.token,
  );
  return ctx.json(node);
});

app.openapi($list_nodes, async (ctx) => {
  const auth = ctx.get("auth");
  const { id } = ctx.req.param();
  const [nodes] = await surreal.query<Node[]>(
    `select * from node where service = $id`,
    { id },
    auth.token
  );
  return ctx.json(nodes);
});

app.all("/:id/fetch/*", async (ctx) => {
  const auth = ctx.get("auth");
  const { id } = ctx.req.param();
  const [nodes] = await surreal.query<Node[]>(
    `select * from node where service = $id`,
    { id },
    auth.token,
  );
  if (nodes.length <= 0) {
    return ctx.notFound();
  }
  const i = Math.floor(Math.random() * 10) % nodes.length;
  const node = nodes[i];
  const url = `${node.url}${/\/fetch.*/.exec(ctx.req.url)![0].slice(6)}`;
  const req = new Request(url, ctx.req.raw);
  return fetch(req);
});

export default app;
