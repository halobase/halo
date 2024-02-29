<script>
  import { browser } from "$app/environment";

  export let title = "返回";

  function goback() {
    if (browser) {
      window.history.back();
    }
  }
</script>

<button
  class="btn btn-sm btn-ghost btn-square justify-start"
  type="button"
  on:click={goback}
>
  <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
    <path
      fill="none"
      stroke="currentColor"
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="2"
      d="m15 6l-6 6l6 6"
    />
  </svg>
  <span class="hidden sm:inline-block mx-1 font-semibold">{title}</span>
</button>
