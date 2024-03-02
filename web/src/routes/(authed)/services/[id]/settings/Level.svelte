<script>
  import { Confirm, notify } from "$lib";
  /** @type {import("$lib/types").Service} */
  export let service;
  let enable = false;
  const levels = [
    { title: "仅自己", value: 0 },
    { title: "所有人", value: -1 }
  ];
</script>

<div class="flex items-center justify-between px-3 py-2">
  <div class="intro">
    <h3>访问控制</h3>
    <p>设置谁能访问到该模型</p>
  </div>
  <button class="btn btn-error" type="button" on:click={() => (enable = true)}>
    设置
  </button>
</div>

<Confirm
  bind:enable
  action="/services/{service.id}?/update"
  title="访问控制"
  confirm="保存"
  on:success={() => {
    notify({
      type: "info",
      message: "操作成功"
    });
    enable = false;
  }}
>
  <p class="text-intro">选择谁能访问到模型：{service.schema.info.title}</p>
  <div class="grid gap-2">
    {#each levels as { title, value }}
      <label class="radio radio-alpha p-2 text-center">
        <input type="radio" name="level" {value} checked={value === service.level} />
        <span>{title}</span>
      </label>
    {/each}
  </div>
</Confirm>
