<script>
  import { GoBack } from "$lib";

  /** @type {import("$lib/types").Assistant} */
  export let assistant;
</script>

<header class="grid grid-cols-3 items-center py-1 sm:py-2">
  <div>
    <GoBack />
  </div>
  <div class="font-semibold text-center">{assistant.name}</div>
  <div></div>
</header>
