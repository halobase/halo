<script>
  import { goto } from "$app/navigation";
  import { Confirm } from "$lib";
  /** @type {import("$lib/types").Assistant} */
  export let assistant;
  let enable = false;
</script>

<div class="flex items-center justify-between px-3 py-2">
  <div class="intro">
    <h3>删除该专家</h3>
    <p>删除后不可恢复，请慎重！</p>
  </div>
  <button class="btn btn-error" type="button" on:click={() => (enable = true)}>
    删除
  </button>
</div>

<Confirm
  bind:enable
  color="error"
  action="?/delete&id={assistant.id}"
  title="删除 {assistant.name}"
  confirm="确认删除"
  on:success={async () => {
    await goto("/assistants");
  }}
/>
