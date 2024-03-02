import { deserialize_response } from '$lib/utils/encoding.js';
import { fail } from '@sveltejs/kit';

export const actions = {
  create: async function (event) {
    const res = await event.fetch(`/_api/services`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        icon: "🌐",
        schema: {
          openapi: "3.0.3",
          info: {
            title: "未命名模型",
            version: "0.0.1"
          },
        }
      }),
    });
    const [service, error] = await deserialize_response(res);
    return error ? fail(res.status, error) : service;
  },
};