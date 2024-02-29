<script>
  import Menu from "./Menu.svelte";

  /** @type {import("$lib/types").SchemaGrouped} */
  export let schema;
  const { groups } = schema;
</script>

<Menu {groups} />
