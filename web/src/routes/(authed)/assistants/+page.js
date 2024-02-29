export async function load(event) {
  /** @type {import("$lib/types").Assistant[]} */
  const assistants = await event.fetch("/_api/assistants").then(res => res.json());
  return {
    assistants,
  }
}