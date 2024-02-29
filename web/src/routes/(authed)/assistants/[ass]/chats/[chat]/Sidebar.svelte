<script>
  import { goto } from "$app/navigation";
  import { page } from "$app/stores";
  import { Form, Icon } from "$lib";
  import { locale_datetime } from "$lib/utils/format";
  /** @type {import("$lib/types").Chat[]} */
  export let chats;
  /** @type {import("$lib/types").Assistant} */
  export let assistant;

  /** @param {CustomEvent<import("$lib/types").Chat>} e  */
  async function __create(e) {
    await goto(`/assistants/${assistant.id}/chats/${e.detail.id}`);
  }
</script>

<div class="w-80 xl:w-80 2xl:w-96 p-4 xl:px-8 flex flex-col gap-6">
  <Form
    action="/assistants/{assistant.id}/chats?/create"
    color="unset"
    align="full"
    on:success={__create}
  >
    <svelte:fragment slot="submit">
      <Icon icon="message" />
      <span class="ml-2">+ 新对话</span>
    </svelte:fragment>
  </Form>
  <ul class="flex flex-col gap-4">
    {#each chats as chat}
      {@const href = `/assistants/${assistant.id}/chats/${chat.id}`}
      <li>
        <a
          class="card px-3 py-2 intro"
          class:card-active={$page.url.pathname.startsWith(href)}
          {href}
        >
          <h6>{chat.summary}</h6>
          <div class="flex justify-between">
            <p>{locale_datetime(chat.created_at)}</p>
          </div>
        </a>
      </li>
    {/each}
  </ul>
</div>
