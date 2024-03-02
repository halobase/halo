import { createRoute, z } from "@hono/zod-openapi";
import { $base, $openapi } from "@lib/$";


export const $ServiceInit = z.object({
  readme: z.string({ description: "Service README content in plain text." }).optional(),
  schema: z.any({ description: "OpenAPI 3.0 schema." }).optional(),
  icon: z.string({ description: "Service icon. Can be any emoji character." }).optional(),
  level: z.number({ description: "Users with this level have accessible to this service." }).optional(),
}).openapi("ServiceInit");

export const $Service = $base.merge($ServiceInit).openapi("Service");

export const $Node = $base.extend({
  url: z.string({ description: "Service node URL." }),
  service: z.string({ description: "Service ID." }),
  user: z.string({ description: "User ID." }),
  tags: z.array(z.string({ description: "Service node tag." })),
}).openapi("Node");

export const $NodeInit = z.object({
  id: z.string(),
  url: z.string(),
  tags: z.array(z.string()),
}).openapi("NodeInit");

export const $ServicePathParam = z.object({
  id: z.string({ description: "Service ID." }),
}).openapi("ServicePathParam");

export const $list = createRoute({
  method: "get",
  path: "/",
  summary: "List services",
  description: "List all services you have ownership or verfied access to.",
  operationId: "services-list-services",
  tags: [
    "Services"
  ],
  responses: {
    200: {
      description: "List services response.",
      content: {
        "application/json": {
          schema: z.array($Service),
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
  operationId: "services-get-service",
  tags: [
    "Services"
  ],
  request: {
    params: $ServicePathParam,
  },
  responses: {
    200: {
      description: "The Service object.",
      content: {
        "application/json": {
          schema: $Service,
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
  operationId: "services-get-service-schema",
  tags: [
    "Services"
  ],
  request: {
    params: $ServicePathParam,
  },
  responses: {
    200: {
      description: "The OpenAPI v3.0.3 schema object.",
      content: {
        "application/json": {
          schema: $openapi,
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
  operationId: "services-get-service-readme",
  tags: [
    "Services"
  ],
  request: {
    params: $ServicePathParam,
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
  operationId: "services-create-service",
  tags: [
    "Services"
  ],
  request: {
    body: {
      content: {
        "application/json": {
          schema: $ServiceInit,
        }
      },
      required: true,
    }
  },
  responses: {
    201: {
      description: "The service object created",
      content: {
        "application/json": {
          schema: $Service,
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
  operationId: "services-update-service",
  tags: [
    "Services"
  ],
  request: {
    params: $ServicePathParam,
    body: {
      content: {
        "application/json": {
          schema: $ServiceInit,
        }
      },
      required: true,
    }
  },
  responses: {
    200: {
      description: "The service object updated",
      content: {
        "application/json": {
          schema: $Service,
        }
      }
    },
    404: {
      description: "Service with the given ID does not exist."
    }
  },
});

export const $delete = createRoute({
  method: "delete",
  path: "/{id}",
  summary: "Delete a service",
  description: "Delete a service.",
  operationId: "services-delete-service",
  tags: [
    "Services"
  ],
  request: {
    params: $ServicePathParam,
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
  operationId: "services-put-service-node",
  tags: [
    "Services"
  ],
  request: {
    params: $ServicePathParam,
    body: {
      content: {
        "application/json": {
          schema: $NodeInit,
        }
      },
      required: true,
    }
  },
  responses: {
    200: {
      description: "",
      content: {
        "application/json": {
          schema: $Node,
        }
      },
    },
  }
});

export const $list_nodes = createRoute({
  method: "get",
  path: "/{id}/nodes",
  summary: "List service nodes",
  description: "List service nodes you have ownership or verfied access to.",
  operationId: "services-list-service-nodes",
  tags: [
    "Services"
  ],
  request: {
    params: $ServicePathParam,
  },
  responses: {
    200: {
      description: "An array of the Node object.",
      content: {
        "application/json": {
          schema: z.array($Node),
        }
      }
    }
  }
});
