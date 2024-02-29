<script>
  import { LightSwitch } from "$lib";
  import Brand from "./Brand.svelte";
  import Nav from "./Nav.svelte";
  import Search from "./Search.svelte";
  import Session from "./Session.svelte";

  let enable = false;
</script>

<header class="border-b border-fore border-opacity-15 px-4 py-2 sm:p-5">
  <div class="w-full flex items-center justify-between">
    <div class="w-1/4 lg:w-1/3">
      <Brand />
    </div>
    <div class="hidden md:block grow">
      <button
        class="input input-center input-readonly text-intro"
        type="button"
        on:click={() => (enable = true)}
      >
      🔍 全局搜索
      </button>
    </div>
    <div class="w-1/4 lg:w-1/3 flex items-center justify-end gap-2 sm:gap-3">
      <Search bind:enable />
      <Nav />
      <LightSwitch />
      <Session />
    </div>
  </div>
</header>
