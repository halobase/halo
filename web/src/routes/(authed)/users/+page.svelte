<script>

  import List from "./List.svelte";
  export let data;
  /** @type {import("$lib/types").Service[]} */;
    // @ts-ignore
  let approve;
  $: applylogs = data.applylogs;
  let users = data.users;
  let services = data.services;
  function __approve() {
    let user = users.find((user) => user.id === applylogs[0].user);
    // @ts-ignore
    approve.__toggle(user,applylogs[0].service)
  }
</script>

<svelte:head>
  <title>API Keys | 精准农业数字模型 AI 服务平台</title>
  <meta name="description" content="API Keys | 精准农业数字模型 AI 服务平台 " />
</svelte:head>
<div class="container container-lg lg:pt-8 2xl:pt-16">
  {#if applylogs.length > 0}
      <button class="btn btn-alpha" type="button" on:click={__approve}>
        {applylogs.length} 条授权待处理
      </button>
      {/if}
  <List {users}{services} bind:this={approve} />
</div>
