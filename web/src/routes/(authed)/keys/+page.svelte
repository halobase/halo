<script>
  import { Clipboard, Dialog, Form } from "$lib";
  import List from "./List.svelte";

  export let data;

  $: keys = data.keys;
  let scopes = data.scopes;
  let enable = false;
  let created = "";

  function __toggle() {
    enable = !enable;
  }

  /** @param {CustomEvent<typeof keys[0]>} e  */
  function __create(e) {
    const key = e.detail;
    created = key.key_onetime ?? "";
    __toggle();
  }
</script>

<svelte:head>
  <title>API Keys | 精准农业数字模型 AI 服务平台</title>
  <meta name="description" content="API Keys | 精准农业数字模型 AI 服务平台 " />
</svelte:head>

<div class="container container-lg lg:pt-8 2xl:pt-16">
  <div class="flex flex-col justify-between gap-6 md:flex-row 2xl:mb-6">
    <div class="intro intro-2xl">
      <h1>API Keys</h1>
      <p>
        API Key 用于服务端到服务端通信，所以不能将其暴露在任何客户端。
      </p>
      <p>
        所有 API Key 不会被明文存储，且只能在刚生成时可见。如果丢失或泄露，则需生成新的 API Key, 
        同时更新使用了该 API key 的应用。更多关于 API key 的信息见
        <a
          class="underline"
          href="https://en.wikipedia.org/wiki/API_key"
          target="_blank"
          rel="noopener noreferrer">API key</a
        >.
      </p>
    </div>
    <div>
      <button class="btn btn-alpha" type="button" on:click={__toggle}>
        + 生成 API Key
      </button>
    </div>
  </div>
  {#if created}
    <div class="card card-info p-4">
      <p class="mb-1">生成成功!</p>
      <p>
        请立刻保存新生成的 API key, 它不会再显示，如果丢失或泄露，则需重新生成。
      </p>
      <div class="py-1"></div>
      <Clipboard value={created} />
    </div>
  {/if}
  <List {keys} />
</div>

<Dialog bind:enable title="生成 API Key">
  <Form action="?/create" on:success={__create}>
    <label>
      <h3>名称</h3>
      <input class="input" type="text" name="name" value="API Key" required />
    </label>
    <div class="group">
      <h3>作用域</h3>
      <div class="flex flex-wrap gap-4 mt-2">
        {#each scopes as scope}
          <label class="checkbox checkbox-alpha checkbox-sm">
            <input type="checkbox" name="scope" value={scope} />
            {scope}
          </label>
        {/each}
      </div>
    </div>
    <svelte:fragment slot="submit">生成</svelte:fragment>
  </Form>
</Dialog>
