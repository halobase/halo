import { createRoute } from "@hono/zod-openapi";
import { $user } from "@lib/$";

export const $get = createRoute({
  method: "get",
  path: "/",
  summary: "Get the authenticated user",
  description: "Get the authenticated user.",
  operationId: "user-get-authenticated-user",
  tags: [
    "User"
  ],
  responses: {
    200: {
      description: "A user object",
      content: {
        "application/json": {
          schema: $user,
        }
      }
    }
  }
});
