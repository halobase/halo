<script>
  import { Form, notify } from "$lib";

  /** @type {import("$lib/types").Assistant} */
  export let assistant;
</script>

<div class="intro intro-xl">
  <h2>通用</h2>
  <p></p>
</div>
<Form
  action="?/update&partial=general"
  align="left"
  on:success={() => {
    notify({
      type: "info",
      message: "操作成功"
    });
  }}
>
  <label class="md:w-1/2">
    <h3>名称</h3>
    <input class="input" type="text" name="name" value={assistant.name} />
  </label>
  <label>
    <h3>描述</h3>
    <textarea
      class="input h-20"
      name="description"
      value={assistant.description}
    />
  </label>
  <svelte:fragment slot="submit">保存</svelte:fragment>
  <svelte:fragment slot="pending">保存中</svelte:fragment>
</Form>
