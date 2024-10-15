export async function load(event) {
    /** @type {Array<import("$lib/types").Service>} */
    const services = await event.fetch("/_api/services")
      .then(res => res.json());
  /** @type {Array<import("$lib/types").User>} */
  const users = (await event.fetch("/_api/user/users")
    .then(res => res.json()));
  users.sort((b, a) => (new Date(a.created_at ?? 0)).getTime()
    - (new Date(b.created_at ?? 0)).getTime());
  const applylogs = (await event.fetch("/_api/permission/examine")
    .then(res => res.json()));
  return {
    applylogs,
    users,
    services,
  };
}
