<script>
  import OA3Parameters from "./OA3Parameters.svelte";
  import OA3RequestBody from "./OA3RequestBody.svelte";
  import OA3Responses from "./OA3Responses.svelte";

  /** @type {import("openapi3-ts/oas30").OperationObject} */
  export let op;
  /** @type {any} */
  export let root;

  $: body = op.requestBody;
  $: params = op.parameters;
  $: responses = op.responses;
</script>

<div class="intro intro-2xl grow">
  <div class="flex flex-col gap-6">
    <div>
      <h2>请求</h2>
      <div class="flex flex-col gap-6">
        {#if params}
          <OA3Parameters {params} {root} />
        {/if}
        {#if body}
          <OA3RequestBody {body} {root} />
        {/if}
      </div>
    </div>
    <OA3Responses {responses} {root} />
  </div>
</div>
