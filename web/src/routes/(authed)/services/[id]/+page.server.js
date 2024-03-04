import { deserialize_response } from '$lib/utils/encoding.js';
import { get } from '$lib/utils/object.js';
import { fail } from '@sveltejs/kit';

export const actions = {
  delete: async function (event) {
    const res = await event.fetch(`/_api/services/${event.params.id}`, {
      method: "DELETE",
    });
    const [service, error] = await deserialize_response(res);
    return error ? fail(res.status, error) : service;
  },
  update: async function (event) {
    let update = {};

    const form = await event.request.formData();
    const schema = get(form, "schema");
    if (schema)
      update = { ...update, schema: JSON.parse(schema) };
    const readme = get(form, "readme");
    if (readme)
      update = { ...update, readme };

    const level = +get(form, "level");
    update = { ...update, level };

    const res = await event.fetch(`/_api/services/${event.params.id}`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(update),
    });
    const [service, error] = await deserialize_response(res);
    return error ? fail(res.status, error) : service;
  },
};