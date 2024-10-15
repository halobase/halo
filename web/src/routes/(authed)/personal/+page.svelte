<script>
  import { Clipboard, Dialog, Form } from "$lib";
  import { locale_datetime } from "$lib/utils/format";
  export let data;
  let applylog = data.applylog
    /** @type {import("$lib/types").User} */
  let user = data.user
  let permissions = user.permission;
      /** @type {import("$lib/types").Service[]} */
  let services = data.services
  let un_permissions = services.filter(service => !permissions.includes(service.id));
  let own_permissions = services.filter(service => permissions.includes(service.id));
  let enable = false;
  function __toggle() {
    if (applylog.state === "pending"){
      alert("正等待审批")
    }
    else{
      enable = !enable;
    }
    
  }
    /** @param {CustomEvent<import("$lib/types").Applylog>} e */
  function __approve(e) {
    __toggle();
    applylog = e.detail
  }
</script>

<svelte:head>
  <title>数字农艺专家</title>
  <meta name="description" content="数字农艺专家" />
</svelte:head>

<div class="container container-lg lg:pt-8 2xl:pt-16">
  <div class="flex flex-col justify-between   2xl:mb-6 ">
    <div class="intro intro-2xl flex justify-between">
      <h1>基本信息</h1>
      <div>
        <button class="btn btn-alpha"
        type="button"
        on:click={() => __toggle()} >
          + 申请服务权限
        </button>
      </div>
    </div>
      <div class="card grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10 p-4 ">
        <div class="flex">
          <h4>用户名称 : {user.name} </h4>
          <!-- <button
          class="btn btn-ghost btn-error btn-xs"
          type="button"
          on:click={() => __toggle()}
        >
          <span class="sm:hidden">🖊️</span>
          <span class="hidden sm:block">🖊️</span>
        </button> -->
        </div>
          <h4>账户余额 : {user.balance}</h4>
          <h4>注册时间 : {user.created_at ? locale_datetime(user.created_at) : "-"}</h4>
          <h4>联系邮箱 : {user.email}</h4>
      </div>
  </div>
    </div>
    <Dialog bind:enable title="申请权限"  >
      <Form action="?/apply" on:success={__approve} >
        <div class="intro intro-2xl">
        <h3>已通过权限</h3>
        {#if permissions.length === 0}
        <div class="text-center text-intro py-3">暂无</div>
        {/if}
        <div  class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">    
          {#each own_permissions as { id, schema }}
          <label class="checkbox checkbox-alpha checkbox-sm">
            <input
              type="checkbox"
              value={id}
              disabled
              checked
            >
            {schema?.info?.title}
          </label>
        {/each}
        </div>
        <h3>待申请权限</h3>
        {#if un_permissions.length === 0}
        <div class="text-center text-intro py-3">暂无</div>
        {/if}
        <div  class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">    
          {#each un_permissions as { id, schema }}
          <label class="checkbox checkbox-alpha checkbox-sm">
            <input
              type="checkbox"
              value={id}
              name="permission"
            >
            {schema?.info?.title}
          </label>
        {/each}
        </div>
      </div>
        <svelte:fragment slot="submit">申请</svelte:fragment>
      </Form>
    </Dialog>