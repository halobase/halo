<script>
  import { Markdown } from "$lib";

  /** @type {string} */
  export let url;
</script>

<div>
  <div class="intro intro-2xl">
    <h2>文档</h2>
  </div>
  {#if url}
    {#await fetch(url)}
      <div class="grid gap-4">
        <div class="skeleton h-32"></div>
        <div class="skeleton h-56"></div>
      </div>
    {:then res}
      {#await res.text() then text}
        <Markdown {text} />
      {/await}
    {:catch err}
      <div class="card card-error">{err.message}</div>
    {/await}
  {/if}
</div>
