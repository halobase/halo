<script>
  import { Dialog } from "$lib";
  /** @type {boolean} */
  export let enable;
</script>

<button
  class="btn btn-sm btn-square md:hidden"
  type="button"
  title="search"
  on:click={() => (enable = !enable)}
>
  <svg class="w-5 h-5" viewBox="0 0 24 24">
    <path
      fill="none"
      stroke="currentColor"
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="2"
      d="M3 10a7 7 0 1 0 14 0a7 7 0 1 0-14 0m18 11l-6-6"
    />
  </svg>
</button>

<Dialog bind:enable title="全局搜索">
  <div class="w-full p-4"></div>
</Dialog>
