import { createRoute, z } from "@hono/zod-openapi";
import { $base } from "@lib/$";

export const $ServiceInit = z
  .object({
    readme: z.string({ description: "模型详细描述。" }).optional(),
    openapi: z.string({ description: "OpenAPI 3.0 schema." }),
    icon: z.string({ description: "模型图标。" }).optional(),
    level: z
      .number({
        description: "模型等级。"
      })
      .optional(),
    name: z.string({ description: "模型名称。" }).optional(),
    description: z.string({ description: "模型简要描述。" }).optional()
  })
  .openapi("ServiceInit");

export const $Service = $base
  .merge(
    $ServiceInit.merge(
      z.object({
        tools: z.array(z.any({ description: "语言模型需要的工具描述。" }))
      })
    )
  )
  .openapi("Service");

export type Service = z.infer<typeof $Service>;

export type Node = z.infer<typeof $Node>;

export const $Node = $base
  .extend({
    url: z.string({ description: "Service node URL." }),
    service: z.string({ description: "Service ID." }),
    user: z.string({ description: "User ID." }),
    tags: z.array(z.string({ description: "Service node tag." }))
  })
  .openapi("Node");

export const $NodeInit = z
  .object({
    url: z.string({ description: "Service node URL." }),
    tags: z.array(z.string({ description: "Service tag name." }))
  })
  .openapi("NodeInit");

export const $ServicePathParam = z
  .object({
    id: z.string({ description: "Service ID." })
  })
  .openapi("ServicePathParam");

export const $list = createRoute({
  method: "get",
  path: "/",
  summary: "List services",
  description: "List all services you have ownership or verfied access to.",
  operationId: "service-list",
  tags: ["Service"],
  security: [{ api_key: [] }, { api_token: [] }],
  responses: {
    200: {
      description: "List services response.",
      content: {
        "application/json": {
          schema: z.array($Service)
        }
      }
    }
  }
});

export const $get = createRoute({
  method: "get",
  path: "/{id}",
  summary: "Get a service",
  description: "Get a service you have ownership or verfied access to.",
  operationId: "service-get",
  tags: ["Service"],
  request: {
    params: $ServicePathParam
  },
  responses: {
    200: {
      description: "The Service object.",
      content: {
        "application/json": {
          schema: $Service
        }
      }
    }
  }
});

export const $schema = createRoute({
  method: "get",
  path: "/{id}/schema",
  summary: "Get a service schema",
  description: "Get a service schema you have ownership or verfied access to.",
  operationId: "service-get-schema",
  tags: ["Service"],
  request: {
    params: $ServicePathParam
  },
  responses: {
    200: {
      description: "The OpenAPI v3.0.3 schema object.",
      content: {
        "application/json": {
          schema: z.object({}, { description: "OpenAPI v3.0.3 object." })
        }
      }
    }
  }
});

export const $readme = createRoute({
  method: "get",
  path: "/{id}/readme",
  summary: "Get a service readme",
  description: "Get a service readme you have ownership or verfied access to.",
  operationId: "service-get-readme",
  tags: ["Service"],
  request: {
    params: $ServicePathParam
  },
  responses: {
    200: {
      description: "The service readme in Markdown format.",
      content: {
        "text/plain": {
          schema: z.string({ description: "Service README in plain text." })
        }
      }
    }
  }
});

export const $post = createRoute({
  method: "post",
  path: "/",
  summary: "Create a service",
  description: "Create a service.",
  operationId: "service-create",
  tags: ["Service"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: $ServiceInit
        }
      },
      required: true
    }
  },
  responses: {
    201: {
      description: "The service object created",
      content: {
        "application/json": {
          schema: $Service
        }
      }
    },
    403: {
      description: "Forbidden."
    }
  }
});

export const $update = createRoute({
  method: "put",
  path: "/{id}",
  summary: "Update a service",
  description: "Update a service.",
  operationId: "service-update-service",
  tags: ["Service"],
  request: {
    params: $ServicePathParam,
    body: {
      content: {
        "application/json": {
          schema: $ServiceInit
        }
      },
      required: true
    }
  },
  responses: {
    200: {
      description: "The service object updated",
      content: {
        "application/json": {
          schema: $Service
        }
      }
    },
    404: {
      description: "Service with the given ID does not exist."
    }
  }
});

export const $delete = createRoute({
  method: "delete",
  path: "/{id}",
  summary: "Delete a service",
  description: "Delete a service.",
  operationId: "service-delete",
  tags: ["Service"],
  request: {
    params: $ServicePathParam
  },
  responses: {
    200: {
      description: ""
    }
  }
});

export const $create_node = createRoute({
  method: "post",
  path: "/{id}/nodes",
  summary: "Create a service node",
  description: "Register a service node",
  operationId: "service-node-create",
  tags: ["Service Node"],
  request: {
    params: $ServicePathParam,
    body: {
      content: {
        "application/json": {
          schema: $NodeInit
        }
      },
      required: true
    }
  },
  responses: {
    200: {
      description: "",
      content: {
        "application/json": {
          schema: $Node
        }
      }
    }
  }
});

export const $list_nodes = createRoute({
  method: "get",
  path: "/{id}/nodes",
  summary: "List service nodes",
  description: "List service nodes you have ownership or verfied access to.",
  operationId: "service-node-list",
  tags: ["Service Node"],
  request: {
    params: $ServicePathParam
  },
  responses: {
    200: {
      description: "An array of the Node object.",
      content: {
        "application/json": {
          schema: z.array($Node)
        }
      }
    }
  }
});
