import { Context } from "hono";
import { OpenAPIHono } from "@hono/zod-openapi";
import { SSEStreamingApi, streamSSE } from "hono/streaming";
import {
  ChatCompletionChunk,
  ChatCompletionMessageParam,
  ChatCompletionTool
} from "openai/resources/index";
import { openai } from "@lib/openai";
import { surreal } from "@lib/surreal";
import {
  $create,
  $delete,
  $get,
  $list,
  $query,
  $update,
  $chat_create,
  $chat_create_message,
  $chat_delete,
  $chat_get,
  $chat_get_abstract,
  $chat_list,
  $chat_list_massages,
  $chat_update,
  $chat_create_message_batch
} from "./$";
import type {
  Assistant,
  LLM,
  Message,
  MessageContent,
  Service,
  Chat,
  FileURL
} from "@lib/types";

const app = new OpenAPIHono({});

const model = "glm-4";

function normalize(cs: MessageContent[]): string {
  let text = "";
  for (const c of cs) {
    switch (c.type) {
      case "text":
        text += c.text;
        break;
      case "file_url":
        text += `
图片链接：${c.file_url.url}
图片类型：${c.file_url.mime_type}
图片大小：${c.file_url.size} 字节`;
        break;
    }
  }
  return text;
}

function normalize_messages(msgs: Message[]): ChatCompletionMessageParam[] {
  return msgs.map(({ role, content }) => ({
    role,
    content: normalize(content)
  }));
}

// @ts-ignore
app.openapi($query, async (ctx) => {
  const auth = ctx.get("auth");
  const init = ctx.req.valid("json");
  const { services: service_ids, knowledge, llm, options } = init;

  let tools: Array<ChatCompletionTool> | undefined;

  if (!options.retrieval && service_ids) {
    const [services] = await surreal.query<Service[]>(
      `select tools from service where id inside $service_ids`,
      { service_ids },
      auth.token
    );
    tools = [];
    for (const s of services) {
      if (s.tools) {
        for (const t of s.tools) {
          tools.push(t);
        }
      }
    }
  }

  if (options.retrieval && knowledge) {
    if (!tools) {
      tools = [];
    }
    tools.push({
      // @ts-ignore
      type: "retrieval",
      retrieval: {
        knowledge_id: knowledge
      }
    });
  }

  const messages = normalize_messages(init.messages as Message[]);

  if (
    llm.system_prompt &&
    messages.length > 0 &&
    messages[0].role !== "system"
  ) {
    messages.unshift({
      role: "system",
      content: llm.system_prompt
    });
  }

  console.log(tools);

  return streamSSE(ctx, async (stream) => {
    const res = await openai.chat.completions.create({
      stream: true,
      temperature: llm.temperature,
      model: llm.model ?? model,
      messages,
      tools
    });
    for await (const chunk of res) {
      const choice = chunk.choices[0];
      const tool_calls = choice.delta.tool_calls;
      if (tool_calls) {
        messages.push(choice.delta as ChatCompletionMessageParam);
        await stream_tool_calls(
          ctx,
          llm,
          stream,
          messages,
          tool_calls,
          knowledge
        );
        return;
      }
      if (choice.finish_reason === "stop") {
        // TODO: stats
        return;
      }
      await stream.writeSSE({
        event: "message",
        data: JSON.stringify(choice.delta)
      });
    }
  });
});

async function stream_tool_calls(
  ctx: Context,
  llm: LLM,
  stream: SSEStreamingApi,
  messages: Array<ChatCompletionMessageParam>,
  tool_calls: Array<ChatCompletionChunk.Choice.Delta.ToolCall>,
  knowledge: string | undefined
) {
  let tools: Array<ChatCompletionTool> | undefined;
  if (knowledge) {
    tools = [
      {
        // @ts-ignore
        type: "retrieval",
        retrieval: {
          knowledge_id: knowledge
        }
      }
    ];
  }

  console.log(tool_calls);

  for (const tool_call of tool_calls) {
    const { name, arguments: args } = tool_call.function!;
    const [service, endpoint] = name?.split("::") ?? [];
    const url = `${new URL(ctx.req.url).origin}/services/${service}/fetch/${endpoint}`;
    const req = new Request(url, {
      method: "POST",
      headers: ctx.req.raw.headers,
      body: args
    });

    const body = await fetch(req).then((res) => res.text());
    messages.push({
      tool_call_id: tool_call.id ?? "",
      role: "tool",
      content: body
    });
  }

  const res = await openai.chat.completions.create({
    stream: true,
    temperature: llm.temperature,
    model: llm.model ?? model,
    messages,
    tools
  });

  for await (const chunk of res) {
    const choice = chunk.choices[0];
    if (choice.finish_reason === "stop") {
      // TODO: stats
      return;
    }
    await stream.writeSSE({
      event: "message",
      data: JSON.stringify(choice.delta)
    });
  }
}

app.openapi($list, async (ctx) => {
  const auth = ctx.get("auth");
  const asses = await surreal.select<Assistant>("ass", auth.token);
  return ctx.json(asses);
});

app.openapi($create, async (ctx) => {
  const auth = ctx.get("auth");
  const init = ctx.req.valid("json");
  const [ass] = await surreal.create<Assistant>("ass", init, auth.token);
  return ctx.json(ass);
});

app.openapi($update, async (ctx) => {
  const auth = ctx.get("auth");
  const init = ctx.req.valid("json");
  const { id } = ctx.req.param();
  const [ass] = await surreal.update<Assistant>(id, init, auth.token);
  return ctx.json(ass);
});

app.openapi($delete, async (ctx) => {
  const auth = ctx.get("auth");
  const { id } = ctx.req.param();
  const [ass] = await surreal.delete<Assistant>(id, auth.token);
  return ctx.json(ass);
});

app.openapi($get, async (ctx) => {
  const auth = ctx.get("auth");
  const { id } = ctx.req.param();
  const [ass] = await surreal.select<Assistant>(id, auth.token);
  return ctx.json(ass);
});

app.openapi($chat_list, async (ctx) => {
  const auth = ctx.get("auth");
  const { id } = ctx.req.param();
  const [chats] = await surreal.query<Chat[]>(
    `select * from chat where assistant = $id order by created_at desc`,
    { id },
    auth.token
  );
  return ctx.json(chats);
});

app.openapi($chat_create, async (ctx) => {
  const auth = ctx.get("auth");
  const init = ctx.req.valid("json");
  const { id } = ctx.req.param();
  const [chat] = await surreal.create<Chat>("chat", { ...init, assistant: id }, auth.token);
  return ctx.json(chat);
});

app.openapi($chat_get, async (ctx) => {
  const auth = ctx.get("auth");
  const { chat_id } = ctx.req.param();
  const [chat] = await surreal.select<Chat>(chat_id, auth.token);
  return ctx.json(chat);
});

app.openapi($chat_update, async (ctx) => {
  const auth = ctx.get("auth");
  const { chat_id } = ctx.req.param();
  const init = ctx.req.valid("json");
  const [chat] = await surreal.update<Chat>(chat_id, init, auth.token);
  return ctx.json(chat);
});

app.openapi($chat_delete, async (ctx) => {
  const auth = ctx.get("auth");
  const { chat_id } = ctx.req.param();
  const [chat] = await surreal.delete<Chat>(chat_id, auth.token);
  return ctx.json(chat);
});

app.openapi($chat_create_message, async (ctx) => {
  const auth = ctx.get("auth");
  const { chat_id } = ctx.req.param();
  const init = ctx.req.valid("json");
  const [msg] = await surreal.create<Message>(
    "msg",
    { ...init, chat: chat_id },
    auth.token
  );
  return ctx.json(msg);
});

app.openapi($chat_create_message_batch, async (ctx) => {
  const auth = ctx.get("auth");
  const { chat_id } = ctx.req.param();
  const init = ctx.req.valid("json");
  const msgs = init.map(v => ({ ...v, chat: chat_id }));
  const [batch] = await surreal.query<Message[]>(
    `for $m in $msgs {
      create msg content $m;
    };`,
    { msgs },
    auth.token,
  )
  return ctx.json(batch);
});

app.openapi($chat_list_massages, async (ctx) => {
  const auth = ctx.get("auth");
  const { chat_id } = ctx.req.param();
  const [msgs] = await surreal.query<Message[]>(
    `select * from msg where chat = $chat order by created_at asc`,
    { chat: chat_id },
    auth.token
  );
  return ctx.json(msgs);
});

app.openapi($chat_get_abstract, async (ctx) => {
  const auth = ctx.get("auth");
  const { chat_id } = ctx.req.param();
  const [msgs] = await surreal.query<Message[]>(
    `select * from msg where chat = $chat order by created_at asc`,
    { chat: chat_id },
    auth.token
  );

  let contents: MessageContent[] | null = null;
  for (const m of msgs) {
    if (m.role === "user") {
      contents = m.content;
      break;
    }
  }

  let text = "";
  let files: FileURL[] = [];
  if (contents) {
    for (const v of contents) {
      switch (v.type) {
        case "text":
          text = v.text;
          break;
        case "file_url":
          files.push(v.file_url);
      }
    }
  }
  return ctx.json({ text, files });
});

export default app;
