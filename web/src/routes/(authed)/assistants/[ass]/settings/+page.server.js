import { deserialize_response } from '$lib/utils/encoding.js';
import { from_formdata, get } from '$lib/utils/object.js';
import { fail } from '@sveltejs/kit';

export const actions = {
  update: async function (event) {
    const partial = event.url.searchParams.get("partial");
    const form = await event.request.formData();
    let update;

    switch (partial) {
      case "general":
        update = {
          name: get(form, "name"),
          description: get(form, "description"),
        };
        break;
      case "llm":
        update = {
          llm: {
            model: get(form, "llm.model"),
            system_prompt: get(form, "llm.system_prompt"),
            temperature: +get(form, "llm.temperature"),
            top_p: +get(form, "llm.top_p"),
          },
        };
        break;
      case "danger":
        update = {
          level: +get(form, "level"),
        };
        break;
      case "extension":
        update = {
          services: form.getAll("services").map(v => v.toString()),
          knowledge: get(form, "knowledge"),
        };
        break;
      default:
        return fail(400, { message: "Bad request" });
    }

    const res = await event.fetch(`/_api/assistants/${event.params.ass}`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(update),
    });

    const [assistant, error] = await deserialize_response(res);
    return error ? fail(res.status, error) : assistant;
  },
  delete: async function (event){
    const id = event.url.searchParams.get("id");
    const res = await event.fetch(`/_api/assistants/`+id, {
      method: "DELETE",
    });

    const [assistant, error] = await deserialize_response(res);
    return error ? fail(res.status, error) : assistant;
  }
};