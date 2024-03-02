<script>
  import { OA3Operation } from "$lib";
  import { schema } from "../../store";
  import Example from "./Example.svelte";

  export let data;
  $: id = data.id;
  $: root = $schema;
  $: op = root?.operations[id];
</script>

<div class="container container-2xl 2xl:px-20">
  <header class="intro intro-2xl">
    {#if op}
      <h1>{op.summary}</h1>
      <p>{op.description}</p>
      {#each root?.servers ?? [] as { url }}
        {@const { method, path } = op}
        <div class="card p-2 pr-3 text-intro mt-4 w-fit">
          <span
            class="badge rounded-md uppercase mr-2"
            class:badge-info={method === "get"}
            class:badge-debug={method === "post"}
            class:badge-error={method === "delete"}
            class:badge-warn={method === "put"}
          >
            {method}
          </span>
          {url}{path}
        </div>
      {/each}
    {:else}
      <div class="flex flex-col gap-4">
        <span class="skeleton w-1/3 h-12" />
        <span class="skeleton" />
        <span class="skeleton w-2/3" />
      </div>
    {/if}
  </header>
  <main class="flex flex-col lg:flex-row gap-8 2xl:gap-16 items-stretch">
    {#if op}
      <OA3Operation {op} {root} />
    {:else}
      <div class="grid gap-4 grow">
        <span class="skeleton w-1/5 h-12" />
        <span class="skeleton h-8" />
        <span class="skeleton" />
        <span class="skeleton" />
        <span class="skeleton" />
      </div>
    {/if}
    <aside class="w-full lg:w-1/2 2xl:w-2/5 self-start sticky top-8">
      {#if op}
        <Example {op} />
      {:else}
        <div class="grid gap-4">
          <div class="skeleton h-32"></div>
          <div class="skeleton h-56"></div>
        </div>
      {/if}
    </aside>
  </main>
</div>
