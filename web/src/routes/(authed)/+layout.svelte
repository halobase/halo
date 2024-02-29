<script>
  import { Menu, SidebarApp } from "$lib";
  import Copyright from "./Copyright.svelte";
  export let data;
  const { slugs } = data;
</script>

<SidebarApp>
  <svelte:fragment slot="sidebar">
    <div class="h-full flex flex-col justify-between">
      <Menu {slugs} size="lg" />
      <Copyright />
    </div>
  </svelte:fragment>
  <svelte:fragment slot="route">
    <slot />
  </svelte:fragment>
</SidebarApp>
