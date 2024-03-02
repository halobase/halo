export async function load(event) {
  /** @type {import("$lib/types").Service} */
  const service = await event.fetch(`/_api/services/${event.params.id}`)
    .then(res => res.json());
  
  return {
    service,
  }
}
