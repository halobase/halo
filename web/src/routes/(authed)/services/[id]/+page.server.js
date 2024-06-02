import { deserialize_response } from '$lib/utils/encoding.js';
import { get_or_undefined } from '$lib/utils/object.js';
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

    const schema = get_or_undefined(form, "schema");
    if (schema !== undefined) {
      update = { ...update, schema: JSON.parse(schema || "{}") };
    }

    const readme = get_or_undefined(form, "readme");
    if (readme !== undefined) {
      update = { ...update, readme };
    }

    const level = get_or_undefined(form, "level");
    if (level !== undefined) {  // level can be zero
      update = { ...update, level: +level };
    }

    console.log(update);

    const res = await event.fetch(`/_api/services/${event.params.id}`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(update),
    });
    
    const [service, error] = await deserialize_response(res);
    return error ? fail(res.status, error) : service;
  },
};