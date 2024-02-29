<script>
  import Sidebar from "./Sidebar.svelte";

  export let data;
  const { service, schema } = data;
  const id = "service-operations";
</script>

<div class="drawer drawer-l drawer-s-lg drawer-scale">
  <input type="checkbox" {id} title={id} />
  <aside>
    <label for={id} />
    <div class="w-80 sm:w-fit p-3 md:p-4 border-r border-fore border-opacity-15">
      <div class="sm:w-48 xl:w-64 2xl:w-80 grow">
        <Sidebar {schema} service={service.id} />
      </div>
    </div>
  </aside>
  <main class="flex flex-col w-full">
    <slot />
  </main>
</div>
