import { deserialize_response } from '$lib/utils/encoding.js';
import { get } from '$lib/utils/object.js';
import { fail } from '@sveltejs/kit';

export const actions = {
  create: async function (event) {
    const form = await event.request.formData();
    const name = get(form, "name");
    const state= get(form, "state");
    const purpose = get(form, "purpose");
    const lives = +get(form, "lives");
    const authority = form.getAll("services").map(v => v.toString());
    const scopes = form.getAll("scope").map(v => v.toString());
    const res = await event.fetch("/_api/keys", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name,purpose, lives, scopes, authority,state}),
    });
    /** @type {import("$lib/utils/types").ResponseDeserialized<import("$lib/types").Key>} */
    const [key, err] = await deserialize_response(res);
    if (err) return fail(res.status, err);
    return key;
  },
  approve:async function (event) {
    const form = await event.request.formData();
    const id = get(form, "id");
    const res = await event.fetch(`/_api/keys/${id}`, {
      method: "DELETE",
    });
    const [, err] = await deserialize_response(res);
    if (err) return fail(res.status, err);
    return {};
  },
  delete: async function (event) {
    const form = await event.request.formData();
    const id = get(form, "id");
    const res = await event.fetch(`/_api/keys/${id}`, {
      method: "DELETE",
    });
    const [, err] = await deserialize_response(res);
    if (err) return fail(res.status, err);
    return {};
  },
};