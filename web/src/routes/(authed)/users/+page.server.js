import { deserialize_response } from '$lib/utils/encoding.js';
import { get } from '$lib/utils/object.js';
import { fail } from '@sveltejs/kit';

export const actions = {
  approve:async function (event) {
    const form = await event.request.formData();
    const userId = get(form, "user");
    const applylog = get(form, "applylog");
    const own_permission = form.getAll("own_permission").map(v => v.toString());
    const un_permission = form.getAll("un_permission").map(v => v.toString());
    const permission = [...own_permission, ...un_permission];
    const res = await event.fetch("/_api/permission/approve", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        permission:permission,
        userId: userId,
        applylog:applylog
      }),
    });
    const [users, err] = await deserialize_response(res);
    
    return err ? fail(res.status, err) : users;
  },
};