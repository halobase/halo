<script>
  import { highlight } from "./stores";

  /** @type {string} */
  export let title = "Code";
  /** @type {import("./types").Code[]} */
  export let codes;

  let selected = codes[0].lang;
</script>

<div class="card">
  <header>
    <h6 class="text-sm font-semibold">{title}</h6>
    <div class="flex gap-2">
      <button class="btn btn-sm btn-square btn-light py-0 h-7" type="button">
        <svg class="w-5 h-5" viewBox="0 0 24 24">
          <g
            fill="none"
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
          >
            <path
              d="M7 9.667A2.667 2.667 0 0 1 9.667 7h8.666A2.667 2.667 0 0 1 21 9.667v8.666A2.667 2.667 0 0 1 18.333 21H9.667A2.667 2.667 0 0 1 7 18.333z"
            />
            <path
              d="M4.012 16.737A2.005 2.005 0 0 1 3 15V5c0-1.1.9-2 2-2h10c.75 0 1.158.385 1.5 1"
            />
          </g>
        </svg>
      </button>
      <select class="select w-fit h-7 py-0 pr-8" bind:value={selected}>
        {#each codes as { lang }}
          <option value={lang}>{lang}</option>
        {/each}
      </select>
    </div>
  </header>
  {#each codes as { lang, content }}
    <div
      class="p-2 text-[13px] font-[18px] overflow-x-auto sb-none"
      class:hidden={lang !== selected}
    >
      {#if $highlight}
        <pre><code>{@html $highlight({ lang, content })}</code></pre>
      {:else}
        <pre><code>{content}</code></pre>
      {/if}
    </div>
  {/each}
</div>

<style lang="postcss">
  header {
    @apply flex items-center justify-between;
    @apply border-b border-fore border-opacity-15;
    @apply bg-alpha-500 bg-opacity-10;
    @apply p-1.5 pl-2 rounded-t-lg;
  }
</style>
