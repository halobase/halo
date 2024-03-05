import { env } from '$env/dynamic/public';

export async function load(event) {
  /** @type {import("$lib/types").User=} */
  const user = await event.fetch("/_api/user")
    .then(res => res.ok ? res.json() : undefined);

  const api_url = env.PUBLIC_API_URL;
  return {
    user,
    api_url,
  }
}