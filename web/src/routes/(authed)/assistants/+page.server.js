import { deserialize_response } from '$lib/utils/encoding.js';
import { get } from '$lib/utils/object.js';
import { fail } from '@sveltejs/kit';

export const actions = {
  create: async function (event) {
    const form = await event.request.formData();

    const res = await event.fetch(`/_api/assistants`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        name: get(form, "name"),
        description: get(form, "description"),
      }),
    });

    const [assistant, error] = await deserialize_response(res);
    return error ? fail(res.status, error) : assistant;
  }
};