<script>
  import { groupby } from "$lib/utils/object";
  import { deref_if_needed } from "./lib";

  /** @type {import("openapi3-ts/oas30").OperationObject["parameters"]} */
  export let params;
  /** @type {import("openapi3-ts/oas30").OpenAPIObject} */
  export let root;

  $: groups = groupby(params ?? [], function (p) {
    const param = deref_if_needed(p, root);
    return param?.in;
  });
</script>

<div>
  {#if groups}
    <ul>
      {#each Object.entries(groups) as [_in, params]}
        <li>
          <h3 class="capitalize">{_in} Parameters</h3>
          {#each params as p}
            {@const { name, required, schema } = deref_if_needed(p) ?? {}}
            {@const { type, description } = deref_if_needed(schema, root) ?? {}}
            <div class="flex justify-between">
              <div class="text-sm font-semibold">
                {name}
                <span class="ml-2 font-normal">{type}</span>
              </div>
              {#if required}
                <span class="badge badge-info text-[11px]">Required</span>
              {/if}
            </div>
            <p class="text-intro text-xs">{description ?? ""}</p>
          {/each}
        </li>
      {/each}
    </ul>
  {/if}
</div>
