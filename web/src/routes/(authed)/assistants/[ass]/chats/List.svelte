<script>
  import { Confirm, Icon } from "$lib";
  import { locale_datetime } from "$lib/utils/format";

  /** @type {import("$lib/types").Chat[]} */
  export let chats;
  /** @type {import("$lib/types").Assistant} */
  export let assistant;

  let remove = false;
  let edit = false;
  /** @type {import("$lib/types").Chat} */
  let target;
</script>

<div class="grid grid-cols-1 gap-4">
  {#each chats as chat}
    {@const href = `/assistants/${assistant.id}/chats/${chat.id}`}
    <div class="card intro intro-xl px-4 py-2">
      <div class="flex justify-between">
        <div class="grid">
          <a class="hover:underline" {href}><h3>{chat.summary}</h3></a>
        </div>
        <div>
          <button
            class="btn btn-sm btn-ghost btn-square"
            type="button"
            on:click={() => {
              target = chat;
              edit = true;
            }}
          >
            <Icon icon="edit" />
          </button>
          <button
            class="btn btn-sm btn-ghost btn-square btn-error text-error-400"
            type="button"
            on:click={() => {
              target = chat;
              remove = true;
            }}
          >
            <Icon icon="trash" />
          </button>
        </div>
      </div>
      <div class="text-intro">{locale_datetime(chat.created_at)}</div>
    </div>
  {/each}
</div>

<Confirm
  action="?/delete"
  title="删除对话"
  color="error"
  confirm="删除"
  bind:enable={remove}
  on:success={() => (remove = false)}
>
  <div class="intro" slot="intro">
    <p>
      确认要删除对话 <strong>{target?.summary}</strong> 吗？删除后无法恢复。
    </p>
  </div>
  <input class="hidden" type="text" name="chat_id" value={target?.id} />
</Confirm>

<Confirm
  action="?/update"
  title="编辑对话"
  confirm="保存"
  bind:enable={edit}
  on:success={() => (edit = false)}
>
  <label>
    <input
      class="input"
      type="text"
      name="summary"
      placeholder="Summary"
      value={target?.summary}
    />
  </label>
  <input class="hidden" type="text" name="chat_id" value={target?.id} />
</Confirm>
