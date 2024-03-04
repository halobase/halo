import { createRoute, z } from "@hono/zod-openapi";
import { $base } from "@lib/$";

export const $MessageInit = z.object({
  role: z.enum(["system", "user", "assistant"]),
  content: z.array(z.any(), { description: "Message content." }),
}).openapi("MessageInit");

export const $ChatInit = z.object({
  assistant: z.string({ description: "Assistant ID." }),
  summary: z.string({ description: "Summary of messages during this chat." }),
}).openapi("ChatInit");

export const $Chat = $base.merge($ChatInit).openapi("Chat");

export const $Message = $base.merge($MessageInit.merge(z.object({
  chat: z.string({ description: "Chat ID." })
}))).openapi("Message");

export const $ChatPathParam = z.object({
  id: z.string({ description: "Chat ID." }),
}).openapi("ChatPathParam");

export const $ChatQuery = z.object({
  assistant: z.string({ description: "Assistant ID." }).optional(),
}).openapi("ChatQuery");

export const $list = createRoute({
  method: "get",
  path: "/",
  summary: "List chats",
  description: "List all chats you have ownership or verfied access to.",
  operationId: "chat-list",
  tags: [
    "Chat"
  ],
  request: {
    query: $ChatQuery,
  },
  responses: {
    200: {
      description: "A list of the Chat object.",
      content: {
        "application/json": {
          schema: z.array($Chat),
        },
      }
    }
  },
});

export const $create = createRoute({
  method: "post",
  path: "/",
  summary: "Create a chat",
  description: "Create a chat.",
  operationId: "chat-create",
  tags: [
    "Chat"
  ],
  request: {
    body: {
      content: {
        "application/json": {
          schema: $ChatInit
        }
      },
      required: true,
    }
  },
  responses: {
    200: {
      description: "The Chat object.",
      content: {
        "application/json": {
          schema: $Chat,
        },
      }
    }
  },
});

export const $update = createRoute({
  method: "put",
  path: "/{id}",
  summary: "Update a chat",
  description: "Update a chat.",
  operationId: "chat-update",
  tags: [
    "Chat"
  ],
  request: {
    params: $ChatPathParam,
    body: {
      content: {
        "application/json": {
          schema: $ChatInit
        }
      },
      required: true,
    }
  },
  responses: {
    200: {
      description: "The modified Chat object.",
      content: {
        "application/json": {
          schema: $Chat,
        },
      }
    }
  },
});

export const $delete = createRoute({
  method: "delete",
  path: "/{id}",
  summary: "Delete a chat",
  description: "Delete a chat you have ownership or verfied access to.",
  operationId: "chat-delete",
  tags: [
    "Chat",
  ],
  request: {
    params: $ChatPathParam,
  },
  responses: {
    200: {
      description: "Successfully deleted."
    }
  }
});

export const $get = createRoute({
  method: "get",
  path: "/{id}",
  summary: "Get a chat",
  description: "Get a chat.",
  operationId: "chat-get",
  tags: [
    "Chat"
  ],
  responses: {
    200: {
      description: "The Chat object.",
      content: {
        "application/json": {
          schema: $Chat,
        },
      }
    }
  },
});

export const $list_massages = createRoute({
  method: "get",
  path: "/{id}/messages",
  summary: "List messages",
  description: "List all messages sent during a chats",
  operationId: "chat-list-messages",
  tags: [
    "Chat"
  ],
  request: {
    params: $ChatPathParam,
  },
  responses: {
    200: {
      description: "A list of the Chat object.",
      content: {
        "application/json": {
          schema: z.array($Message),
        },
      }
    }
  },
});

export const $create_message = createRoute({
  method: "post",
  path: "/{id}/messages",
  summary: "Create a message",
  description: "Create a message to a chats",
  operationId: "chat-create-message",
  tags: [
    "Chat"
  ],
  request: {
    params: $ChatPathParam,
    body: {
      content: {
        "application/json": {
          schema: $MessageInit,
        }
      },
      required: true,
    }
  },
  responses: {
    200: {
      description: "The Message object.",
      content: {
        "application/json": {
          schema: $Message,
        },
      }
    }
  },
});