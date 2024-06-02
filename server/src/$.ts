import { createRoute } from "@hono/zod-openapi";

export const $zen = createRoute({
  method: "get",
  path: "/zen",
  summary: "Get the Zen of Halo",
  description: "Get the Zen of Halo.",
  operationId: "meta-zen",
  tags: ["Meta"],
  responses: {
    200: {
      description: "Zen of Halo.",
      content: {
        "text/plain": {
          schema: {
            type: "string"
          }
        }
      }
    }
  }
});
