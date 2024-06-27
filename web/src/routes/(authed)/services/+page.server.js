import { deserialize_response } from '$lib/utils/encoding.js';
import { fail } from '@sveltejs/kit';

export const actions = {
  create: async function (event) {
    const res = await event.fetch(`/_api/services`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        icon: "🌐",
        name: "未命名模型",
        description: "模型简要介绍",
        openapi: "{}"
      }),
    });
    const [service, error] = await deserialize_response(res);
    return error ? fail(res.status, error) : service;
  },
};