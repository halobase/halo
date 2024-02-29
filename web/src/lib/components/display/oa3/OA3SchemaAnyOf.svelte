<script>
  import OA3Schema from "./OA3Schema.svelte";
  import { deref_if_needed } from "./lib";

  /** @type {import("openapi3-ts/oas30").MediaTypeObject["schema"][]} */
  export let anyOf;
  /** @type {any} */
  export let root;
  $: schemas = anyOf.map((a) => deref_if_needed(a, root));
  $: selected = 0;
</script>

<div>
  {#if schemas}
    <div class="flex items-center gap-2">
      <div class="text-intro">Any of</div>
      <select class="select w-fit h-7 py-0 pr-8" bind:value={selected}>
        {#each schemas as schema, i}
          <option value={i}>{schema?.type}</option>
        {/each}
      </select>
    </div>
    {#each schemas as schema, i}
      <div class:hidden={i !== selected}>
        <OA3Schema {schema} {root} />
      </div>
    {/each}
  {/if}
</div>
