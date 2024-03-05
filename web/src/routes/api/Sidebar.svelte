<script>
  import { GoBack } from "$lib";
  import Menu from "./Menu.svelte";

  /** @type {import("$lib/types").SchemaGrouped} */
  export let schema;
  const { groups } = schema;
</script>

<div class="grid gap-4">
  <div>
    <GoBack />
  </div>
  <Menu {groups} />
</div>
