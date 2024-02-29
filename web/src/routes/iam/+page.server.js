import { deserialize_response } from '$lib/utils/encoding.js';
import { get } from '$lib/utils/object.js';
import { fail } from '@sveltejs/kit';

export async function load(event) {
  return {};
}


export const actions = {
  default: async function (event) {
    const form = await event.request.formData();
    const type = get(form, "type");
    const user = get(form, "user");
    const pass = get(form, "pass");

    const res = await event.fetch(`/_api/iam/token`, {
      method: "POST",
      headers: {"content-type": "application/json"},
      body: JSON.stringify({ type, user, pass }),
    });
    const [token, err] = await deserialize_response(res);
    if (err) {
      return fail(res.status, err);
    }
    /** @type {import("$lib/types").Token} */
    const { access_token, expiry } = token;
    event.cookies.set("hz-token", access_token, {
      expires: new Date(expiry * 1000),
      path: "/",
    })
    return token;
  }
}