<script>
  import { page } from "$app/stores";

  /** @type {import("$lib/types").SchemaGrouped["groups"]} */
  export let groups;
</script>

<nav class="menu menu-sm menu-alpha">
  <ul>
    {#each Object.entries(groups) as [k, ops]}
      <li>
        <details
          open={$page.url.pathname
            .slice("/api/ops/".length)
            .startsWith(k.toLowerCase())}
        >
          <summary class="flex items-center justify-between">
            <span>{k}</span>
            <span class="arrow" />
          </summary>
          <ul class="pl-4 overflow-hidden">
            {#each ops as { operationId, method, summary }}
              {@const href = `/api/ops/${operationId}`}
              <li>
                <a
                  class="flex items-center justify-between"
                  {href}
                  class:active={$page.url.pathname === href}
                >
                  <span class="text-truncated">{summary}</span>
                  <span
                    class="badge uppercase text-[10px]"
                    class:badge-info={method === "get"}
                    class:badge-debug={method === "post"}
                    class:badge-error={method === "delete"}
                    class:badge-warn={method === "put"}
                  >
                    {method}
                  </span>
                </a>
              </li>
            {/each}
          </ul>
        </details>
      </li>
    {/each}
  </ul>
</nav>
