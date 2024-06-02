export async function load(event) {
  /** @type {import("$lib/types").Assistant} */
  const assistant = await event.fetch(`/_api/assistants/${event.params.ass}`).then(res => res.json());
  /** @type {Array<import("$lib/types").Service>} */
  const services = await event.fetch("/_api/services")
    .then(res => res.json());
  return {
    assistant,
    services,
  }
}