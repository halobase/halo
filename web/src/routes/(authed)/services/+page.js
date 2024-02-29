
export async function load(event) {
  /** @type {Array<import("$lib/types").Service>} */
  const services = await event.fetch("/_api/services")
    .then(res => res.json());
  return {
    services,
  };
}