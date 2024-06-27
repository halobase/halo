<script>
    import { env } from '$env/dynamic/public';
  export let data;
</script>

<div class="container container-xl">
  <header class="intro intro-2xl">
    <h1>{data.schema.info.title}</h1>
    <span class="badge">v{data.schema.info.version}</span>
  </header>
  <main class="grid gap-4">
    <div class="card p-4 intro">
      <h3>URL</h3>
      <!-- <p>{data.api_url}</p> -->
       <p>{env.PUBLIC_ORIGIN}</p>
    </div>
    <div class="card p-4 intro">
      <h3>Auth</h3>
      <ul class="grid gap-4 mt-4">
        {#each Object.entries(data.schema.components?.securitySchemes ?? {}) as [k, v]}
          {#if k === "api_key"}
            <li>
              <h4>API Key</h4>
              <p>
                用于服务端-服务端通信，需要手动在
                <a class="underline" href="/keys">API Key 页面</a> 生成，可为每个 API Key
                设置作用域， 限制其能访问的资源。
              </p>
              <p>
                示例：
                <span class="badge capitalize">X-API-Key: 123</span>
              </p>
            </li>
          {:else if k === "api_token"}
            <li>
              <h4>API Token</h4>
              <p>
                用户客户端-服务端通信，<a class="underline" href="/iam">登录</a> 后会自动获取该
                Token。
              </p>
              <p>
                示例：
                <span class="badge capitalize">
                  Authorization: {v.scheme} 123
                </span>
              </p>
            </li>
          {/if}
        {/each}
      </ul>
    </div>
  </main>
</div>
