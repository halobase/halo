<script>
  import { Form, Icon, notify } from "$lib";
  import List from "./List.svelte";
  export let data;
  /** @type {number[]} */
  let inputs = [];
</script>

<main class="container container-md">
  <Form
    action="?/create"
    align="left"
    with_submit={inputs.length > 0}
    on:success={(e) => {
      inputs = [];
      notify({message: `已添加 ${e.detail.length} 个节点`});
    }}
  >
    {#each inputs as _, i}
      <div class="flex items-center gap-2">
        <input
          class="input"
          type="url"
          name="node-{i}"
          placeholder="[{i}] 节点 URL"
          required
        />
        <button
          class="btn btn-error btn-square btn-light"
          type="button"
          on:click={() =>
            ((j) => (inputs = inputs.filter((_, k) => j !== k)))(i)}
        >
          <Icon icon="trash" />
        </button>
      </div>
    {/each}
    <svelte:fragment slot="action">
      <button
        class="btn"
        type="button"
        on:click={() => {
          if (inputs.length > 32) return;
          inputs = [...inputs, 0];
        }}
      >
        + 添加
      </button>
    </svelte:fragment>
    <svelte:fragment slot="submit">保存</svelte:fragment>
  </Form>
  <List nodes={data.nodes} />
</main>
