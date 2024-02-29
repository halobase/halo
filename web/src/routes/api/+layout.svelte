<script>
  import { SidebarApp } from "$lib";
  import { onMount } from "svelte";
  import { fetch_and_group_schema } from "./lib";
  import { schema } from "./store";
  import Sidebar from "./Sidebar.svelte";

  onMount(async function () {
    schema.set(await fetch_and_group_schema());
  });
</script>

<SidebarApp sidebar="loose">
  <svelte:fragment slot="sidebar">
    <div class="h-full flex flex-col justify-between">
      {#if $schema}
        <Sidebar schema={$schema} />
      {:else}
        <div class="flex flex-col gap-4">
          <span class="skeleton w-2/3" />
          <span class="skeleton" />
          <span class="skeleton" />
          <span class="skeleton" />
        </div>
      {/if}
    </div>
  </svelte:fragment>
  <svelte:fragment slot="route">
    <slot />
  </svelte:fragment>
</SidebarApp>
