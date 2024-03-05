<script>
  import OA3RequestBody from "./OA3RequestBody.svelte";

  /** @type {import("openapi3-ts/oas30").OperationObject["responses"]} */
  export let responses;
  /** @type {import("openapi3-ts/oas30").OpenAPIObject} */
  export let root;

  $: entries = Object.entries(responses);
  $: status_selected = entries?.length > 0 ? entries[0][0] : undefined;
</script>

<div>
  {#if status_selected}
    <div class="flex items-center justify-between">
      <h2>响应</h2>
      <div class="flex gap-2">
        {#each entries as [value]}
          <label
            class="radio px-2 py-1"
            class:radio-info={+value >= 200 && +value < 300}
            class:radio-debug={+value >= 300 && +value < 400}
            class:radio-warn={+value >= 400 && +value < 500}
            class:radio-error={+value >= 500}
          >
            <input
              type="radio"
              name="status"
              {value}
              bind:group={status_selected}
            />
            {value}
          </label>
        {/each}
      </div>
    </div>
    {#each entries as [status, body]}
      <div class:hidden={status !== status_selected}>
        <p>{body?.description ?? ""}</p>
        <OA3RequestBody {body} {root} />
      </div>
    {/each}
  {/if}
</div>
