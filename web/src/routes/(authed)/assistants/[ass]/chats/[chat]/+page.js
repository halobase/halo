export async function load(event) {
  /** 
   * @type {[
   *   import("$lib/types").Chat,
   *   import("$lib/types").Message[],
   * ]} 
   */
  const [chat, msgs] = await Promise.all([
    event.fetch(
      `/_api/assistants/${event.params.ass}/chats/${event.params.chat}`
    ).then(res => res.json()),
    event.fetch(
      `/_api/assistants/${event.params.ass}/chats/${event.params.chat}/messages`
    ).then(res => res.json()),
  ])

  return {
    msgs,
    chat,
  };
}
