<script>
  import { Form, notify } from "$lib";

  /** @type {import("$lib/types").Assistant} */
  export let assistant;
  /** @type {import("$lib/types").Service[]} */
  export let services;
</script>

<div class="intro intro-xl">
  <h2>扩展</h2>
  <p></p>
</div>

<Form
  action="?/update&partial=extension"
  align="left"
  on:success={() => {
    notify({
      type: "info",
      message: "操作成功"
    });
  }}
>
  <label class="md:w-1/2">
    <h3>知识库</h3>
    <select class="select" name="knowledge" disabled>
      <option value={assistant.knowledge}>{assistant.knowledge}</option>
    </select>
  </label>
  <label class="md:w-1/2">
    <h3>模型服务</h3>
    <select class="select" name="services" multiple value={assistant.services}>
      {#each services as { id, schema }}
        <option value={id}>{schema?.info?.title}</option>
      {/each}
    </select>
  </label>
  <svelte:fragment slot="submit">保存</svelte:fragment>
  <svelte:fragment slot="pending">保存中</svelte:fragment>
</Form>
