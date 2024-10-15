<script>
  import { Dialog, Form } from "$lib";
  import { locale_datetime } from "$lib/utils/format";
  /** @type {import("$lib/types").User[]} */
  export let users;
        /** @type {import("$lib/types").Service[]} */
  export let services;
          /** @type {import("$lib/types").Service[]} */
  $: un_permissions = [];
          /** @type {import("$lib/types").Service[]} */
  $: own_permissions = [];
  /** @type Array<string> */
  $: apply_permissions = [];
  $: userId = ""
  let enable = false;
  let applylog = false
  $: dialogTitle = "权限审批";
  // @ts-ignore
  export function __toggle(user,apply_permission) {
    enable = !enable;
    userId = user?.id
    dialogTitle = `${user?.name} 的权限审批`
    un_permissions = services.filter(service => !user?.permission.includes(service.id));
    own_permissions = services.filter(service => user?.permission.includes(service.id));
    apply_permissions = apply_permission
    if (apply_permission) applylog = true
  }
  /** @param {CustomEvent<typeof users>} e  */
  function __updated(e) {
    users = e.detail; 
    users.sort((a, b) => (new Date(a.created_at ?? 0)).getTime()
    - (new Date(b.created_at ?? 0)).getTime());
    __toggle();
  }
</script>

<div class="card overflow-x-auto">
  <table class="table table-fixed table-outline table-nowrap">
    <thead>
      <tr>
        <th class="w-10"></th>
        <th>用户名</th>
        <th >余额</th>
        <th class="cell-lg">上次使用</th>
        <th class="w-10 sm:w-20"></th>
      </tr>
    </thead>
    <tbody>
      {#each users as user}
        <tr>
          <td class="pr-0">🙂</td>
          <td>{user.name}</td>
          <td >{user.balance}</td>
          <td class="cell-lg"
            >{user.created_at ? locale_datetime(user.created_at) : "-"}</td
          >
          <td class="px-0 text-center">
            <button
              class="btn btn-ghost btn-error btn-xs"
              type="button"
              on:click={() => __toggle(user)}
            >
              <span class="sm:hidden">🔍</span>
              <span class="hidden sm:block">查看权限</span>
            </button>
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
  {#if users.length === 0}
    <div class="text-center text-intro py-3">Empty</div>
  {/if}
</div>

<Dialog bind:enable title={dialogTitle} >
  <Form action="?/approve" on:success={__updated}>
    <h3>已获取权限（取消勾选可收回权限）</h3>
    {#if own_permissions.length === 0}
    <div class="text-center text-intro py-3">暂无</div>
    {/if}
    <div  class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">    
      {#each own_permissions as { id, schema }}
      <label class="checkbox checkbox-alpha checkbox-sm">
        <input
          type="checkbox"
          value={id}
          checked
          name="own_permission"
        >
        {schema?.info?.title}
      </label>
    {/each}
    </div>
    <h3>暂无权限（勾选为授予权限）</h3>
    <div  class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">    
      {#each un_permissions as { id, schema }}
      <label class="checkbox checkbox-alpha checkbox-sm">
        <input
          autocomplete="new-password"
          type="checkbox"
          value={id}
          checked={apply_permissions?.includes(id)}
          name="un_permission"
        >
        {schema?.info?.title}
      </label>
    {/each}
    </div>
    <label>
      <input
        type="hidden"
        value={userId}
        name="user"
      >
    </label>
    <label>
      <input
        type="hidden"
        value={applylog}
        name="applylog"
      >
    </label>
    <svelte:fragment slot="submit">修改</svelte:fragment>
  </Form>
</Dialog>
