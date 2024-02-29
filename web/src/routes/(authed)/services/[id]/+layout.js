export async function load(event) {
  const { id } = event.params;
  /** @type {import("$lib/types").Service} */
  const service = await event.fetch(`/_api/services/${id}`)
    .then(res => res.json());
  return {
    service,
    id,
  }
}
