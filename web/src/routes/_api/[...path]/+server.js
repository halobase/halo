import { env } from "$env/dynamic/public";

export const GET = handle;
export const POST = handle;
export const DELETE = handle;
export const PUT = handle;
export const PATCH = handle;

const base_url = env.PUBLIC_API_URL;
console.log("[halo] Using env.PUBLIC_API_URL:", env.PUBLIC_API_URL);

/** @param {import("./$types").RequestEvent} event  */
async function handle(event) {
  const url = `${base_url}/${event.params.path}${event.url.search}`;
  const req = event.request;
  req.headers.set("Authorization", `Bearer ${event.cookies.get("hz-token")}`)
  req.headers.delete("hz-token")
  return event.fetch(url, req);
}
