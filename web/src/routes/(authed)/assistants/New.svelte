<script>
  import { goto } from "$app/navigation";
  import { Confirm } from "$lib";
  let enable = false;
</script>

<button class="btn btn-alpha" type="button" on:click={() => (enable = true)}>
  + 新建
</button>

<Confirm
  action="?/create"
  title="创建专家"
  confirm="创建"
  bind:enable
  on:success={async (e) => {
    await goto(`/assistants/${e.detail.id}/settings`);
  }}
>
  <label>
    <h3>名称 *</h3>
    <input class="input" type="text" value="未命名专家" name="name" required />
  </label>
  <label>
    <h3>描述</h3>
    <textarea class="input h-20" name="description" placeholder="描述" />
  </label>
</Confirm>
