import { PUBLIC_API_URL } from "$env/static/public";

export const GET = handle;
export const POST = handle;
export const DELETE = handle;
export const PUT = handle;
export const PATCH = handle;

const base_url = PUBLIC_API_URL;

/** @param {import("./$types").RequestEvent} event  */
async function handle(event) {
  const url = `${base_url}/${event.params.path}${event.url.search}`;
  const req = event.request;
  req.headers.set("Authorzation", event.cookies.get("hz-token") ?? "")
  return event.fetch(url, req);
}
