<script>
  import { Icon } from "$lib";
  import { locale_datetime } from "$lib/utils/format";

  /** @type {import("$lib/types").Chat[]} */
  export let chats;
  /** @type {import("$lib/types").Assistant} */
  export let assistant;
</script>

<div class="grid grid-cols-1 gap-4">
  {#each chats as chat}
    {@const href = `/assistants/${assistant.id}/chats/${chat.id}`}
    <div class="card intro intro-xl px-4 py-2">
      <div class="flex justify-between">
        <a class="hover:underline" {href}><h2>{chat.summary}</h2></a>
        <div>
          <button class="btn btn-sm btn-ghost btn-square" type="button">
            <Icon icon="edit" />
          </button>
          <button
            class="btn btn-sm btn-ghost btn-square btn-error text-error-400"
            type="button"
          >
            <Icon icon="trash" />
          </button>
        </div>
      </div>
      <div class="text-intro">{locale_datetime(chat.created_at)}</div>
    </div>
  {/each}
</div>

