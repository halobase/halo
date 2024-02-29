export async function load(event) {
  /** @type {import("$lib/types").User=} */
  const user = await event.fetch("/_api/user")
    .then(res => res.ok ? res.json() : undefined);
  return {
    user,
  }
}