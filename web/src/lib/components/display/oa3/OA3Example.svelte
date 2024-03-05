<script>
  import Codeblock from "../Codeblock.svelte";
  import { examples } from "./examples";

  /** @type {import("$lib/types").Operation} */
  export let op;
  /** @type {import("$lib/types").OpenAPI} */
  export let root;
  /** @type {string} */
  export let title;

  $: codes = Object.entries(examples(op, root)).map(([k, v]) => ({
    lang: k,
    content: v
  }));
</script>

<div class="grid gap-4">
  {#if codes}
    <Codeblock {codes} {title} />
  {/if}
</div>
