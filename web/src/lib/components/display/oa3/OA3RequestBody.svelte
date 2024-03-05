<script>
  import OA3Schema from "./OA3Schema.svelte";
  import { deref_if_needed } from "./lib";

  /** @type {import("openapi3-ts/oas30").OperationObject["requestBody"]} */
  export let body;
  /** @type {import("openapi3-ts/oas30").OpenAPIObject} */
  export let root;

  /** @type {import("openapi3-ts/oas30").RequestBodyObject | undefined} */
  $: body_dereffed = deref_if_needed(body, root);
  $: entries = Object.entries(body_dereffed?.content ?? {});
  $: selected = entries.length > 0 ? entries[0][0] : undefined;
</script>

<div>
  {#if selected}
    <div class="flex items-center justify-between">
      <h3>Body</h3>
      <select class="select w-fit h-7 py-0 pr-8" bind:value={selected}>
        {#each entries as [value]}
          <option {value}>{value}</option>
        {/each}
      </select>
    </div>
    {#each entries as [type, { schema }]}
      <div class:hidden={type !== selected}>
        <OA3Schema {schema} {root} />
      </div>
    {/each}
  {/if}
</div>
