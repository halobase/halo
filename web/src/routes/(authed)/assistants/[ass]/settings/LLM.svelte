<script>
  import { Form, notify } from "$lib";
  import { env } from '$env/dynamic/public';
  /** @type {import("$lib/types").Assistant} */
  export let assistant;
</script>

<div class="intro intro-xl">
  <h2>语言模型</h2>
  <p></p>
</div>
<Form
  action="?/update&partial=llm"
  align="left"
  on:success={() => {
    notify({
      type: "info",
      message: "操作成功"
    });
  }}
>
  <label class="md:w-1/2">
    <h3>模型</h3>
    <select class="select" name="llm.model" value={assistant.llm.model}>
      <option value="glm-4-air">glm-4-air</option>
      <option value={env.PUBLIC_MODEL_TYPE}>备选方案</option>
    </select>
  </label>
  <label>
    <h3>系统提示词</h3>
    <textarea
      class="input h-20"
      name="llm.system_prompt"
      value={assistant.llm.system_prompt}
    />
  </label>
  <label class="lg:w-1/2">
    <h3>温度系数</h3>
    <div class="flex items-center gap-4">
      <input
        class="range"
        type="range"
        name="llm.temperature"
        min="0.01"
        max="1.0"
        step="0.01"
        bind:value={assistant.llm.temperature}
      />
      <span class="w-8">{assistant.llm.temperature}</span>
    </div>
  </label>
  <label class="lg:w-1/2">
    <h3>核采样率</h3>
    <div class="flex items-center gap-4">
      <input
        class="range"
        type="range"
        name="llm.top_p"
        min="0.01"
        max="1.0"
        step="0.01"
        bind:value={assistant.llm.top_p}
      />
      <span class="w-8">{assistant.llm.top_p}</span>
    </div>
  </label>
  <svelte:fragment slot="submit">保存</svelte:fragment>
  <svelte:fragment slot="pending">保存中</svelte:fragment>
</Form>
