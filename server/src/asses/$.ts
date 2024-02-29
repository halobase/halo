import { createRoute, z } from "@hono/zod-openapi";
import { $base } from "@lib/$";

export const $QueryMessage = z.object({
  role: z.enum(["system", "user", "assistant"]),
  content: z.array(z.any(), { description: "Message content." }),
}).openapi("QueryMessage");

export const $LLM = z.object({
  model: z.string(),
  system_prompt: z.string(),
  temperature: z.number().gt(0),
  top_p: z.number().gt(0),
}).openapi("LLM");

export const $AssistantInit = z.object({
  name: z.string({ description: "Assistant name." }),
  description: z.string({ description: "Assistant description." }).optional(),
  public: z.boolean({ description: "Accessible by everyone." }),
  knowledge: z.string({ description: "Knowledge ID." }).optional(),
  services: z.array(z.string(), { description: "Service IDs." }),
  llm: $LLM,
}).openapi("AssistantInit");

export const $Assistant = $base.merge($AssistantInit).openapi("Assistant");

export const $QueryInit = z.object({
  messages: z.array($QueryMessage),
  services: z.array(z.string()).optional(),
  knowledge: z.string().optional(),
  llm: $LLM,
  options: z.object({
    retrieval: z.boolean({description: "Use retrieval or not."}).optional(),
  })
}).openapi("QueryInit");

export const $AssistantPathParam = z.object({
  id: z.string({ description: "Assistant ID." }),
}).openapi("AssistantPathParam");

export const $query = createRoute({
  method: "post",
  path: "/query",
  summary: "Question answering",
  description: "Question answering with optional services or documents.",
  operationId: "assistants-query",
  tags: [
    "Assistants"
  ],
  request: {
    body: {
      content: {
        "application/json": {
          schema: $QueryInit
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
          schema: $QueryMessage
        },
        "text/event-stream": {
          schema: $QueryMessage
        }
      }
    }
  },
});

export const $create = createRoute({
  method: "post",
  path: "/",
  summary: "Create an assistant",
  description: "Create an assistant.",
  operationId: "assistants-create-assistant",
  tags: [
    "Assistants"
  ],
  request: {
    body: {
      content: {
        "application/json": {
          schema: $AssistantInit
        }
      },
      required: true,
    }
  },
  responses: {
    200: {
      description: "The Assistant object.",
      content: {
        "application/json": {
          schema: $Assistant,
        },
      }
    }
  },
});



export const $list = createRoute({
  method: "get",
  path: "/",
  summary: "List assistants",
  description: "List all assistants you have ownership or verfied access to.",
  operationId: "assistants-list-assistants",
  tags: [
    "Assistants"
  ],
  responses: {
    200: {
      description: "A list of the Assistant object.",
      content: {
        "application/json": {
          schema: z.array($Assistant),
        },
      }
    }
  },
});

export const $get = createRoute({
  method: "get",
  path: "/{id}",
  summary: "Get an assistant",
  description: "Get an assistant.",
  operationId: "assistants-get-assistant",
  tags: [
    "Assistants"
  ],
  request: {
    params: $AssistantPathParam,
  },
  responses: {
    200: {
      description: "The modified Assistant object.",
      content: {
        "application/json": {
          schema: $Assistant,
        },
      }
    }
  },
});

export const $update = createRoute({
  method: "put",
  path: "/{id}",
  summary: "Update an assistant",
  description: "Update an assistant.",
  operationId: "assistants-update-assistant",
  tags: [
    "Assistants"
  ],
  request: {
    params: $AssistantPathParam,
    body: {
      content: {
        "application/json": {
          schema: $AssistantInit
        }
      },
      required: true,
    }
  },
  responses: {
    200: {
      description: "The modified Assistant object.",
      content: {
        "application/json": {
          schema: $Assistant,
        },
      }
    }
  },
});

export const $delete = createRoute({
  method: "delete",
  path: "/{id}",
  summary: "Delete an assistant",
  description: "Delete an assistant you have ownership or verfied access to.",
  operationId: "assistants-delete-assistant",
  tags: [
    "Assistants",
  ],
  request: {
    params: $AssistantPathParam,
  },
  responses: {
    200: {
      description: "Successfully deleted."
    }
  }
});
