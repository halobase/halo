<script>
  import { Icon } from "$lib";
  import Sidebar from "./Sidebar.svelte";

  export let data;
  const { service, schema } = data;
  const id = "service-operations";
</script>

<div class="drawer drawer-l drawer-s-lg drawer-scale">
  <input type="checkbox" {id} title={id} />
  <aside>
    <label for={id} />
    <div class="w-80 lg:w-64 p-3 md:p-4 border-r border-fore border-opacity-15">
      <Sidebar {schema} service={service.id} />
    </div>
  </aside>
  <main class="flex flex-col w-full">
    <header class="px-6 py-4 flex justify-between">
      <label class="btn btn-sm btn-square btn-ghost" for="service-operations">
        <Icon icon="sidebar-left" />
      </label>
      <slot name="action" />
    </header>
    <slot />
  </main>
</div>
