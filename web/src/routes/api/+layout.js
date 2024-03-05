export async function load(event) {
  /** @type {import("$lib/types").OpenAPI} */
  const schema = await event.fetch("/_api/schema").then((res) => res.json());
  return {
    schema,
  };
}
