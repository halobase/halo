<script>
  import DangerDelete from "./DangerDelete.svelte";
  import DangerLevel from "./DangerLevel.svelte";

  /** @type {import("$lib/types").Assistant} */
  export let assistant;
</script>

<div class="intro intro-xl">
  <h2>危险操作</h2>
</div>
<nav class="card card-list border-error-500">
  <DangerLevel {assistant} />
  <DangerDelete {assistant} />
</nav>
