<script>
  import { marked } from "marked";
  /** @type {string} */
  export let text;
</script>

<article class="markdown">
  {@html marked(text)}
</article>
