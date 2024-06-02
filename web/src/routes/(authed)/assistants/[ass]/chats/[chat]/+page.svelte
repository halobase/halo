<script>
  import Header from "./Header.svelte";
  import List from "./List.svelte";
  import Prompt from "./Prompt.svelte";
  import Sidebar from "./Sidebar.svelte";
  import { __chat, __knowledge, __llm, __messages, __services } from "./store";
  export let data;

  let disabled = false;
  let url = "/_api/assistants/query";

  $: __messages.set(data.msgs);
  __chat.set(data.chat);
  __services.set(data.assistant.services);
  __knowledge.set(data.assistant.knowledge);
  __llm.set(data.assistant.llm);

  /** @param {CustomEvent<import("$lib/types").Message>} e  */
  async function __send(e) {
    __messages.update((a) => [...a, e.detail]);
    disabled = true;
  }

  /** @param {CustomEvent<import("$lib/types").Message>} e  */
  async function __recv(e) {
    __messages.update((a) => [...a, e.detail]);
    await backup($__messages.slice(-2));
    if ($__messages.length < 3) {
      await summarize();
    }
    disabled = false;
  }

  async function summarize() {
    /** @type {import("$lib/types").ChatAbstract} */
    const abs = await fetch(
      `/_api/assistants/${data.chat.assistant}/chats/${data.chat.id}/abstract`
    ).then((res) => res.json());
    return fetch(
      `/_api/assistants/${data.chat.assistant}/chats/${data.chat.id}`,
      {
        method: "PUT",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({ summary: abs.text })
      }
    );
  }

  /** @param {import("$lib/types").Message[]} msgs  */
  async function backup(msgs) {
    return fetch(
      `/_api/assistants/${data.chat.assistant}/chats/${data.chat.id}/messages/batch`,
      {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify(msgs)
      }
    );
  }
</script>

<svelte:head>
  <title>{data.chat.summary}</title>
  <meta name="description" content={data.chat.summary} />
</svelte:head>

<div class="drawer drawer-r drawer-s-xl">
  <input type="checkbox" id="chats" />
  <main class="container grow overflow-hidden pt-0">
    <div class="flex flex-col justify-between grow overflow-hidden">
      <Header assistant={data.assistant} />
      <List {url} assistant={data.assistant} on:stop={__recv} />
      <Prompt {disabled} on:send={__send} />
    </div>
  </main>
  <aside class="overflow-y-hidden">
    <label for="chats"></label>
    <Sidebar chats={data.chats} assistant={data.assistant} />
  </aside>
</div>
