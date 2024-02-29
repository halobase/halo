import { Context } from "hono";
import { OpenAPIHono } from "@hono/zod-openapi";
import { SSEStreamingApi, streamSSE } from "hono/streaming";
import { ChatCompletionChunk, ChatCompletionMessageParam, ChatCompletionTool } from "openai/resources/index";
import { OpenAPIObject, RequestBodyObject } from "openapi3-ts/oas30";
import { openai } from "@lib/openai";
import { surreal } from "@lib/surreal";
import { $create, $delete, $get, $list, $query, $update } from "./$";
import type { Assistant, LLM, Message, MessageContent } from "@lib/types";


const app = new OpenAPIHono();

const model = "glm-3-turbo";

function normalize(cs: MessageContent[]): string {
  let text = "";
  for (const c of cs) {
    switch (c.type) {
      case "text": text += c.text; break;
      case "file_url":
        text += `\n${c.file_url.url}`; break;
    }
  }
  return text;
}

function normalize_messages(msgs: Message[]): ChatCompletionMessageParam[] {
  return msgs.map(({ role, content }) => ({
    role,
    content: normalize(content),
  }));
}

// @ts-ignore
app.openapi($query, async (ctx) => {
  const auth = ctx.get("auth");
  const init = ctx.req.valid("json");
  const { services, knowledge, llm, options } = init;

  let tools: Array<ChatCompletionTool> | undefined;

  if (!options.retrieval && services) {
    const [schemas] = await surreal.query<OpenAPIObject[]>(
      `select value schema from service where id inside $services`,
      { services },
      auth.token
    );
    tools = schemas.map((v, i) => {
      const endpoint = v.paths["/"];
      const requestBody = endpoint.post?.requestBody as RequestBodyObject;
      const schama = requestBody.content["application/json"].schema;
      return {
        type: "function",
        function: {
          name: services[i].slice("service:".length),
          description: endpoint.description,
          parameters: schama as Record<string, unknown>
        }
      }
    });
  }

  if (options.retrieval && knowledge) {
    if (!tools) {
      tools = [];
    }
    tools.push({
      // @ts-ignore
      type: "retrieval",
      retrieval: {
        knowledge_id: knowledge,
      }
    });
  }

  console.log(tools);

  const messages = normalize_messages(init.messages as Message[]);

  if (llm.system_prompt && messages.length > 0 && messages[0].role !== "system") {
    messages.unshift({
      role: "system",
      content: llm.system_prompt,
    });
  }

  return streamSSE(ctx, async (stream) => {
    const res = await openai.chat.completions.create({
      stream: true,
      temperature: llm.temperature,
      model: llm.model ?? model,
      messages,
      tools,
    });
    for await (const chunk of res) {
      const choice = chunk.choices[0];
      const tool_calls = choice.delta.tool_calls;
      if (tool_calls) {
        messages.push(choice.delta as ChatCompletionMessageParam);
        await stream_tool_calls(ctx, llm, stream, messages, tool_calls, knowledge);
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
  knowledge: string | undefined,
) {
  let tools: Array<ChatCompletionTool> | undefined;
  if (knowledge) {
    tools = [{
      // @ts-ignore
      type: "retrieval",
      retrieval: {
        knowledge_id: knowledge,
      }
    }];
  }

  for (const tool_call of tool_calls) {
    const { name, arguments: args } = tool_call.function!;
    const url = `${new URL(ctx.req.url).origin}/services/service:${name}/fetch`;
    const req = new Request(url, {
      method: "POST",
      headers: ctx.req.raw.headers,
      body: args
    });

    const body = await fetch(req).then(res => res.text());
    messages.push({
      tool_call_id: tool_call.id ?? "",
      role: "tool",
      content: body,
    });
  }

  const res = await openai.chat.completions.create({
    stream: true,
    temperature: llm.temperature,
    model: llm.model ?? model,
    messages,
    tools,
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
  const [ass] = await surreal.update<Assistant>("ass", init, auth.token);
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

export default app;
