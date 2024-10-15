export async function load(event) {
    /** @type {Array<import("$lib/types").Service>} */
    const services = await event.fetch("/_api/services")
      .then(res => res.json());
  /** @type {import("$lib/types").User} */
  const user = (await event.fetch("/_api/user")
    .then(res => res.json()));
  const applylog = (await event.fetch("/_api/permission/state")
  .then(res => res.json()));
    
  return {
    applylog,
    user,
    services,
  };
}
