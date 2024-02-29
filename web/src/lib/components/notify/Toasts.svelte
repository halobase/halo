<script>
  import Toast from "./Toast.svelte";
  import { toasts } from "./store";
</script>

<div class="fixed top-0 left-0 w-full flex flex-col items-center gap-2 z-50 mt-24">
  {#each $toasts as toast}
    <Toast {toast} />
  {/each}
</div>
