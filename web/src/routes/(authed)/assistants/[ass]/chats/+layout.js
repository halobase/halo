export async function load(event) {
  const { assistant } = await event.parent();
  /** @type {import("$lib/types").Chat[]} */
  const chats = await event.fetch(
    `/_api/assistants/${assistant.id}/chats`
  ).then(res => res.json());

  return {
    chats,
  }
}