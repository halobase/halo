export async function load(event) {
  const { assistant } = await event.parent();
  /** @type {import("$lib/types").Chat[]} */
  const chats = await event.fetch(
    `/_api/chats?assistant=${assistant.id}`
  ).then(res => res.json());

  return {
    chats,
  }
}