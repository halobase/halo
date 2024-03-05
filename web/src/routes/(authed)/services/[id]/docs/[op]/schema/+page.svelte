<script>
  import { OA3Example, OA3Operation } from "$lib";

  export let data;
  $: root = data.schema;
  $: op = root.operations[data.op];
</script>

<div class="flex flex-col xl:flex-row gap-8 2xl:gap-16 items-stretch px-8">
  <aside class="w-full xl:w-1/2 2xl:w-3/5 self-start sticky top-8">
    <OA3Operation {root} {op} />
  </aside>
  <OA3Example {op} {root} title="代码示例" />
</div>
