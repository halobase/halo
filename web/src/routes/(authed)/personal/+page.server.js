import { deserialize_response } from '$lib/utils/encoding.js';
import { get } from '$lib/utils/object.js';
import { fail } from '@sveltejs/kit';

export const actions = {
  apply:async function (event) {
    const form = await event.request.formData();
    const permission = form.getAll("permission").map(v => v.toString()); 
    const res = await event.fetch("/_api/permission/apply", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({permission}),
    });
    const [applylog, err] = await deserialize_response(res);
    return err ? fail(res.status, err) : applylog;
  },
};