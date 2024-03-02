<script>
  import { Form, notify } from "$lib";

  /** @type {import("$lib/types").Service} */
  export let service;
  let value = service.readme;

  /** @param {FileInputEvent} e  */
  async function __file(e) {
    const files = e.target?.files;
    if (!files) return;
    value = await files[0].text();
  }

  function __update() {
    notify({
      type: "info",
      message: "保存成功"
    });
  }
</script>

<div>
  <div class="intro intro-xl mb-4">
    <h2>模型概述</h2>
    <p>
      格式参考
      <a class="underline" href="https://www.markdownguide.org/basic-syntax">
        Markdown 基础语法
      </a>
    </p>
  </div>
  <Form action="/services/{service.id}?/update" on:success={__update}>
    <label>
      <textarea class="input" name="readme" bind:value rows="10"></textarea>
    </label>
    <svelte:fragment slot="action">
      <label class="btn">
        <input
          class="hidden"
          type="file"
          accept="application/json"
          on:change={__file}
        />
        导入文件
      </label>
    </svelte:fragment>
    <svelte:fragment slot="submit">保存</svelte:fragment>
    <svelte:fragment slot="pending">保存中</svelte:fragment>
  </Form>
</div>
