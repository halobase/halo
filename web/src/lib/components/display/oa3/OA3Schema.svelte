<script>
  import OA3SchemaAnyOf from "./OA3SchemaAnyOf.svelte";
  import { deref_if_needed } from "./lib";

  /** @type {import("openapi3-ts/oas30").MediaTypeObject["schema"]} */
  export let schema;
  /** @type {any} */
  export let root;

  /** @type {import("openapi3-ts/oas30").SchemaObject | undefined} */
  $: schema_dereffed = deref_if_needed(schema, root);
  $: required = schema_dereffed?.required ?? [];
  $: type = schema_dereffed?.type;
  $: anyOf = schema_dereffed?.anyOf;
</script>

{#if schema_dereffed}
  {#if anyOf}
    <OA3SchemaAnyOf {anyOf} {root} />
  {:else if type}
    {#if type === "array"}
      <svelte:self schema={schema_dereffed.items} {root} />
    {:else if type === "object"}
      <ul class="pl-4 m-2 mr-0 border-l border-fore border-opacity-15">
        {#each Object.entries(schema_dereffed.properties ?? {}) as [k, v]}
          {@const schema = deref_if_needed(v, root)}
          {@const { type, description } = schema ?? {}}
          <li class="mb-2">
            <details>
              <summary class="appearance-auto cursor-pointer">
                <div class="flex justify-between">
                  <div class="text-sm font-semibold">
                    {k}
                    <span class="ml-2 font-normal">{type}</span>
                  </div>
                  {#if required.includes(k)}
                    <span class="badge badge-info text-[11px]">Required</span>
                  {/if}
                </div>
                <p class="text-intro text-xs">{description ?? "-"}</p>
              </summary>
              {#if type === "object" || type === "array"}
                <svelte:self {schema} {root} />
              {/if}
            </details>
          </li>
        {/each}
      </ul>
    {:else}
      <p>{type}</p>
    {/if}
  {/if}
{/if}
