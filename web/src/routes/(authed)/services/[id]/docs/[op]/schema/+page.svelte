<script>
  import { OA3Operation } from "$lib";
  import ExternalDocs from "./ExternalDocs.svelte";

  export let data;
  const root = data.schema;
  const op = root.operations[data.op];
</script>

<div class="flex flex-col xl:flex-row gap-8 2xl:gap-16 items-stretch px-8">
  <ExternalDocs url={op.externalDocs?.url ?? ""} />
  <aside class="w-full xl:w-1/2 2xl:w-3/5 self-start sticky top-8">
    <OA3Operation {root} {op} />
  </aside>
</div>
