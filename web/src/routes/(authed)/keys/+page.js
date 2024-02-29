export async function load(event) {
  /** @type {Array<import("$lib/types").Key>} */
  const keys = (await event.fetch("/_api/keys")
    .then(res => res.json()));

  keys.sort((a, b) => (new Date(a.created_at ?? 0)).getTime()
    - (new Date(b.created_at ?? 0)).getTime());

  const scopes = [
    "service.read",
    "service.write",
    "servive.delete",
    "ai",
  ];

  return {
    keys,
    scopes,
  };
}
