import { deserialize_response } from '$lib/utils/encoding.js';
import { get, get_or_undefined } from '$lib/utils/object.js';
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
    /** @type {import("openapi3-ts/oas30").OpenAPIObject}  */
    let schema;
    
    const form = await event.request.formData();
    let name = get(form, "name");
    let description = get(form, "description");
    const openapi = get_or_undefined(form, "openapi");
    if (openapi !== undefined) {
      try {
        schema = JSON.parse(openapi);
      } catch {
        return fail(400, { message: "JSON 格式错误" });
      }
      name ||= schema.info.title;
      description ||= schema.info.description?? "";
      update = { ...update, openapi, name, description };
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