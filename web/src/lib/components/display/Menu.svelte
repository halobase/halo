<script>
  import { page } from "$app/stores";
  import { groupby } from "$lib/utils/object";

  /** @type {import("./types").Slug[]} */
  export let slugs;
  /** @type {"sm" | "md" | "lg"} */
  export let size = "md";

  const entries = Object.entries(groupby(slugs, ({ group }) => group));
</script>

<div>
  {#each entries as [group, slugs]}
    <nav class="menu menu-alpha menu-{size}">
      <h3>{group}</h3>
      <ul>
        {#each slugs as slug}
          {@const href = group ? `/${group}/${slug.id}` : `/${slug.id}`}
          <li>
            <a {href} class:active={$page.url.pathname.startsWith(href)}>
              {#if slug.icon}
                <span>{slug.icon}</span>
              {/if}
              <span>{slug.name}</span>
            </a>
          </li>
        {/each}
      </ul>
    </nav>
  {/each}
</div>
