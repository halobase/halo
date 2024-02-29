<script>
  import { Icon } from "$lib";
  export let data;
</script>

<header class="px-6 py-4 flex justify-between">
  <label class="btn btn-sm btn-square btn-ghost" for="service-operations">
    <Icon icon="sidebar-left" />
  </label>
  <a class="btn" href="/services/{data.id}/ops/{data.op}/play">Play →</a>
</header>

<slot />

<footer class="py-4">

</footer>
