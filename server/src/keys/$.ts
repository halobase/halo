import { createRoute, z } from "@hono/zod-openapi";
import { $base } from "@lib/$";

export const $key = $base.extend({
  prefix: z.string(),
  name: z.string(),
  scopes: z.array(z.string()),
  accessed_at: z.string().datetime().optional(),
  expires_at: z.string().datetime().optional(),
  secret: z.string().optional(),
  secret_truncated: z.string(),
  key_onetime: z.string().optional()
});

export const $key_init = z
  .object({
    name: z.string().optional(),
    lives: z.number().optional(),
    scopes: z.array(z.string()).optional()
  })
  .openapi("KeyInit");

export const $list = createRoute({
  method: "get",
  path: "/",
  summary: "List keys",
  description: "List all keys.",
  operationId: "key-list",
  tags: ["Key"],
  responses: {
    200: {
      description: "An array of the Key object.",
      content: {
        "application/json": {
          schema: z.array($key)
        }
      }
    }
  }
});

export const $post = createRoute({
  method: "post",
  path: "/",
  summary: "Create a key",
  description: "Create a Key.",
  operationId: "key-create",
  tags: ["Key"],
  request: {
    body: {
      description: "The Key object",
      content: {
        "application/json": {
          schema: $key_init
        }
      }
    }
  },
  responses: {
    200: {
      description: "The Key object.",
      content: {
        "application/json": {
          schema: $key
        }
      }
    }
  }
});

export const $delete = createRoute({
  method: "delete",
  path: "/{id}",
  summary: "Revoke a key",
  description: "Revoke a key.",
  operationId: "key-revoke",
  tags: ["Key"],
  request: {
    params: z.object({
      id: z.string()
    })
  },
  responses: {
    200: {
      description: "Sucessfully revoked."
    }
  }
});
