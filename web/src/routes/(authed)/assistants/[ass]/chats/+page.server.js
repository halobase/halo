import { deserialize_response } from '$lib/utils/encoding.js';
import { get } from '$lib/utils/object.js';
import { fail } from '@sveltejs/kit';

export const actions = {
  create: async function (event) {
    const { ass } = event.params;
    const res = await event.fetch(`/_api/chats`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        assistant: ass,
        summary: "未命名对话"
      })
    });
    const [chat, error] = await deserialize_response(res);
    return error ? fail(res.status, error) : chat;
  },
  update: async function (event) {
    const form = await event.request.formData();
    const id = get(form, "id");
    const res = await event.fetch(`/_api/chats/${id}`, {
      method: "PUT",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        summary: get(form, "summary"),
      }),
    });
    const [chat, error] = await deserialize_response(res);
    return error ? fail(res.status, error) : chat;
  }
};