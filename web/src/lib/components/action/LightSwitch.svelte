<script>
  import { onMount } from "svelte";
  import { extract_theme, swap_theme } from "./dom";

  let checked = false;

  function __change() {
    const theme = extract_theme();
    if (theme) {
      const theme_next = checked ? theme + "-dark" : theme.replace("-dark", "");
      swap_theme(theme_next, theme);
    }
  }

  onMount(function () {
    const theme = extract_theme();
    checked = theme?.endsWith("-dark") || false;
  });
</script>

<label class="coin">
  <input
    class="hidden"
    type="checkbox"
    title="dark-mode"
    bind:checked
    on:change={__change}
  />
  <div class="btn btn-sm btn-square head">
    <svg class="w-5 h-5" viewBox="0 0 24 24">
      <path
        fill="none"
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M8 12a4 4 0 1 0 8 0a4 4 0 1 0-8 0m-5 0h1m8-9v1m8 8h1m-9 8v1M5.6 5.6l.7.7m12.1-.7l-.7.7m0 11.4l.7.7m-12.1-.7l-.7.7"
      />
    </svg>
  </div>
  <div class="btn btn-sm btn-square tail">
    <svg class="w-5 h-5" viewBox="0 0 24 24">
      <path
        fill="none"
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M12 3h.393a7.5 7.5 0 0 0 7.92 12.446A9 9 0 1 1 12 2.992zm5 1a2 2 0 0 0 2 2a2 2 0 0 0-2 2a2 2 0 0 0-2-2a2 2 0 0 0 2-2m2 7h2m-1-1v2"
      />
    </svg>
  </div>
</label>
