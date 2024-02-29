import { createRoute, z } from "@hono/zod-openapi";
import { $base } from "@lib/$";

const $doc = $base.extend({
  title: z.string(),
});

export const $list = createRoute({
  method: "get",
  path: "/",
  summary: "List documents",
  description: "List all documents used for RAG.",
  operationId: "documents-list-documents",
  tags: [
    "Documents"
  ],
  responses: {
    200: {
      description: "An array of the document object.",
      content: {
        "application/json": {
          schema: z.array($doc)
        }
      }
    }
  }
});
