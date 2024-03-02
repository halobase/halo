import { MiddlewareHandler } from "hono";
import { surreal } from "./surreal";

export function stats(): MiddlewareHandler {
  return async function (ctx, next) {
    const auth = ctx.get("auth");
    try {
      surreal.create("stats", {
        purpose: "",
        url: ctx.req.url,
        method: ctx.req.method,
        header: ctx.req.raw.headers,
        user: auth?.user.id,
      })
    } catch (e) { }
    await next();
  }
}