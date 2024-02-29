<script>
  import { OA3Operation } from "$lib";

  export let data;
  const root = data.schema;
  const op = root.operations[data.op];
</script>

<div class="px-8">
  <OA3Operation {root} {op} />
</div>
