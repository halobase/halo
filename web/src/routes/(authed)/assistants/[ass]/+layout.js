export async function load(event) {
  /** @type {import("$lib/types").Assistant} */
  const assistant = await event.fetch(
    `/_api/assistants/${event.params.ass}`
  ).then(res => res.json());
  return {
    assistant,
  }
}
