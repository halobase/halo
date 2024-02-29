<script>
  import "$lib/index.css";
  import "highlight.js/styles/github-dark.css";
  import hljs from "highlight.js";
  import { PreloadingIndicator, Toasts, highlight } from "$lib";
  import Header from "./Header.svelte";
  import Icons from "./Icons.svelte";
  import { __user } from "./store";

  export let data;

  if (data.user) {
    __user?.set(data.user);
  }

  highlight.set(({ lang, content }) => {
    const language = hljs.getLanguage(lang) ? lang : "plaintext";
    return hljs.highlight(content, { language }).value;
  });
</script>

<PreloadingIndicator />
<Icons />
<Toasts />
<div class="app">
  <Header />
  <slot />
</div>
