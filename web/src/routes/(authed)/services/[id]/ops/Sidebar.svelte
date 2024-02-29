<script>
  import Menu from "./Menu.svelte";

  /** @type {import("$lib/types").SchemaGrouped} */
  export let schema;
  /** @type {string} */
  export let service;
  const { groups } = schema;
</script>

<Menu {service} {groups} />
