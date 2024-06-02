import { createRoute, z } from "@hono/zod-openapi";
import { $base } from "@lib/$";
import { $FileURL } from "../files/$";

export const $QueryMessage = z
  .object({
    role: z.enum(["system", "user", "assistant"]),
    content: z.array(z.any(), { description: "消息内容" })
  })
  .openapi("QueryMessage");

export const $LLM = z
  .object({
    model: z.string({ description: "语言模型" }).default("glm-3-turbo"),
    system_prompt: z.string({ description: "系统提示词" }).default(""),
    temperature: z.number({ description: "温度系数" }).gt(0).default(0.95),
    top_p: z.number({ description: "核采样率" }).gt(0).default(0.7)
  })
  .openapi("LLM");

export const $AssistantInit = z
  .object({
    icon: z.string({ description: "助手图标" }).optional(),
    name: z.string({ description: "助手名称" }).optional(),
    description: z.string({ description: "助手描述" }).optional(),
    level: z.number({ description: "访问控制等级" }).optional(),
    knowledge: z.string({ description: "知识库 ID" }).optional(),
    services: z.array(z.string({ description: "服务 ID" }), { description: "绑定的服务的 ID" }).optional(),
    llm: $LLM.optional(),
  })
  .openapi("AssistantInit");

export const $Assistant = $base.merge($AssistantInit).openapi("Assistant");

export const $QueryInit = z
  .object({
    messages: z.array($QueryMessage, { description: "消息" }),
    services: z.array(z.string({ description: "服务 ID" })).optional(),
    knowledge: z.string({ description: "知识库 ID" }).optional(),
    llm: $LLM,
    options: z.object({
      retrieval: z.boolean({ description: "是否使用外部知识库" }).optional()
    })
  })
  .openapi("QueryInit");

export const $AssistantPathParam = z
  .object({
    id: z.string({ description: "Assistant ID." })
  })
  .openapi("AssistantPathParam");

export const $query = createRoute({
  method: "post",
  path: "/query",
  summary: "Generate",
  description: "Generate outputs with optional services or knowledge.",
  operationId: "assistant-query",
  tags: ["Assistant"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: $QueryInit
        }
      },
      required: true
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
  }
});

export const $create = createRoute({
  method: "post",
  path: "/",
  summary: "Create an assistant",
  description: "Create an assistant.",
  operationId: "assistant-create",
  tags: ["Assistant"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: $AssistantInit
        }
      },
      required: true
    }
  },
  responses: {
    200: {
      description: "The Assistant object.",
      content: {
        "application/json": {
          schema: $Assistant
        }
      }
    }
  }
});

export const $list = createRoute({
  method: "get",
  path: "/",
  summary: "List assistants",
  description: "List all assistants you have ownership or verfied access to.",
  operationId: "assistant-list",
  tags: ["Assistant"],
  responses: {
    200: {
      description: "A list of the Assistant object.",
      content: {
        "application/json": {
          schema: z.array($Assistant)
        }
      }
    }
  }
});

export const $get = createRoute({
  method: "get",
  path: "/{id}",
  summary: "Get an assistant",
  description: "Get an assistant.",
  operationId: "assistant-get",
  tags: ["Assistant"],
  request: {
    params: $AssistantPathParam
  },
  responses: {
    200: {
      description: "The modified Assistant object.",
      content: {
        "application/json": {
          schema: $Assistant
        }
      }
    }
  }
});

export const $update = createRoute({
  method: "put",
  path: "/{id}",
  summary: "更新助手",
  description: "更新助手。",
  operationId: "assistant-update",
  tags: ["Assistant"],
  request: {
    params: $AssistantPathParam,
    body: {
      content: {
        "application/json": {
          schema: $AssistantInit
        }
      },
      required: true
    }
  },
  responses: {
    200: {
      description: "更新后的 Assistant 对象。",
      content: {
        "application/json": {
          schema: $Assistant
        }
      }
    }
  }
});

export const $delete = createRoute({
  method: "delete",
  path: "/{id}",
  summary: "Delete an assistant",
  description: "Delete an assistant you have ownership or verfied access to.",
  operationId: "assistant-delete",
  tags: ["Assistant"],
  request: {
    params: $AssistantPathParam
  },
  responses: {
    200: {
      description: "Successfully deleted."
    }
  }
});

export const $MessageInit = z
  .object({
    role: z.enum(["system", "user", "assistant"]),
    content: z.array(z.any(), { description: "Message content." })
  })
  .openapi("MessageInit");

export const $ChatInit = z
  .object({
    summary: z.string({ description: "Summary of messages during this chat." })
  })
  .openapi("ChatInit");

export const $Chat = $base.merge($ChatInit).openapi("Chat");

export const $Message = $base
  .merge(
    $MessageInit.merge(
      z.object({
        chat: z.string({ description: "Chat ID." })
      })
    )
  )
  .openapi("Message");

export const $ChatPathParam = z
  .object({
    id: z.string({ description: "助手 ID" }),
    chat_id: z.string({ description: "对话 ID." })
  })
  .openapi("ChatPathParam");

export const $ChatAbstract = z
  .object({
    text: z.string({ description: "文本摘要" }),
    files: z.array($FileURL, { description: "文件摘要" })
  })
  .openapi("ChatAbstract");

export const $chat_list = createRoute({
  method: "get",
  path: "/{id}/chats",
  summary: "List chats",
  description: "List all chats you have ownership or verfied access to.",
  operationId: "assistant-chat-list",
  tags: ["Assistant Chat"],
  responses: {
    200: {
      description: "A list of the Chat object.",
      content: {
        "application/json": {
          schema: z.array($Chat)
        }
      }
    }
  }
});

export const $chat_create = createRoute({
  method: "post",
  path: "/{id}/chats",
  summary: "Create a chat",
  description: "Create a chat.",
  operationId: "assistant-chat-create",
  tags: ["Assistant Chat"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: $ChatInit
        }
      },
      required: true
    }
  },
  responses: {
    200: {
      description: "The Chat object.",
      content: {
        "application/json": {
          schema: $Chat
        }
      }
    }
  }
});

export const $chat_update = createRoute({
  method: "put",
  path: "/{id}/chats/{chat_id}",
  summary: "更新对话",
  description: "更新一个您拥有所有权或经过验证的访问权限的对话。",
  operationId: "assistant-chat-update",
  tags: ["Assistant Chat"],
  request: {
    params: $ChatPathParam,
    body: {
      content: {
        "application/json": {
          schema: $ChatInit
        }
      },
      required: true
    }
  },
  responses: {
    200: {
      description: "更新后的 Chat 对象",
      content: {
        "application/json": {
          schema: $Chat
        }
      }
    }
  }
});

export const $chat_delete = createRoute({
  method: "delete",
  path: "/{id}/chats/{chat_id}",
  summary: "删除对话",
  description: "删除您拥有所有权或经过验证的访问权限的对话。",
  operationId: "assistant-chat-delete",
  tags: ["Assistant Chat"],
  request: {
    params: $ChatPathParam
  },
  responses: {
    200: {
      description: "成功删除"
    }
  }
});

export const $chat_get = createRoute({
  method: "get",
  path: "/{id}/chats/{chat_id}",
  summary: "获取对话",
  description: "获取一个您拥有所有权或经过验证的访问权限的对话。",
  operationId: "assistant-chat-get",
  tags: ["Assistant Chat"],
  responses: {
    200: {
      description: "Chat 对象",
      content: {
        "application/json": {
          schema: $Chat
        }
      }
    }
  }
});

export const $chat_list_massages = createRoute({
  method: "get",
  path: "/{id}/chats/{chat_id}/messages",
  summary: "列出消息",
  description: "列出一个对话中的所有消息",
  operationId: "assistant-chat-list-messages",
  tags: ["Assistant Chat"],
  request: {
    params: $ChatPathParam
  },
  responses: {
    200: {
      description: "Message 对象列表",
      content: {
        "application/json": {
          schema: z.array($Message)
        }
      }
    }
  }
});

export const $chat_get_abstract = createRoute({
  method: "get",
  path: "/{id}/chats/{chat_id}/abstract",
  summary: "获取对话摘要",
  description: "获取对话摘要，对话摘要由文本摘要和文件摘要两部分组成",
  operationId: "assistant-chat-get-abstract",
  tags: ["Assistant Chat"],
  request: {
    params: $ChatPathParam
  },
  responses: {
    200: {
      description: "对话摘要",
      content: {
        "application/json": {
          schema: $ChatAbstract
        }
      }
    }
  }
});

export const $chat_create_message = createRoute({
  method: "post",
  path: "/{id}/chats/{chat_id}/messages",
  summary: "创建一条消息",
  description: "创建一条消息",
  operationId: "assistant-chat-create-message",
  tags: ["Assistant Chat"],
  request: {
    params: $ChatPathParam,
    body: {
      content: {
        "application/json": {
          schema: $MessageInit
        }
      },
      required: true
    }
  },
  responses: {
    200: {
      description: "Message 对象",
      content: {
        "application/json": {
          schema: $Message
        }
      }
    }
  }
});

export const $chat_create_message_batch = createRoute({
  method: "post",
  path: "/{id}/chats/{chat_id}/messages/batch",
  summary: "创建一批消息",
  description: "创建一批消息",
  operationId: "assistant-chat-create-message-batch",
  tags: ["Assistant Chat"],
  request: {
    params: $ChatPathParam,
    body: {
      content: {
        "application/json": {
          schema: z.array($MessageInit),
        }
      },
      required: true
    }
  },
  responses: {
    200: {
      description: "Message 对象",
      content: {
        "application/json": {
          schema: z.array($MessageInit),
        }
      }
    }
  }
});
