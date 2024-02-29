<script>
  import { group_tags } from "./lib";
  import { __query } from "./store";

  /** @type {Array<string>} */
  export let tags;

  const G = group_tags(tags);

  /** @type {typeof tags} */
  let tags_selected = [];
  $: if (tags_selected) {
    __query.set({ tags: tags_selected });
  }
</script>

{#each Object.entries(G) as [type, subtypes]}
  <nav class="menu">
    <h3 class="mb-2">{type}</h3>
    <div class="flex flex-wrap gap-2">
      {#each subtypes as subtype}
        <label class="checkbox checkbox-alpha">
          <input
            type="checkbox"
            value="{type}/{subtype}"
            bind:group={tags_selected}
          />
          {subtype}
        </label>
      {/each}
    </div>
  </nav>
{/each}
