<script>
  import Keyword from "./Keyword.svelte";
  import Tags from "./Tags.svelte";
  import { get_tags } from "./lib";

  /** @type {Array<import("$lib/types").Service>} */
  export let services;

  const tags = get_tags(services);
</script>

<div class="flex flex-col gap-4 p-6 xl:pr-10 h-full w-80 sm:w-96 overflow-y-hidden">
  <Keyword />
  <Tags {tags} />
</div>
