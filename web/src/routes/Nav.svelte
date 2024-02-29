<script>
  import { page } from "$app/stores";

  const links = [
    { href: "/api", name: "API 文档", icon: "📖" },
    { href: "/blogs", name: "使用案例", icon: "✒️" }
  ];
</script>

<div class="details details-end">
  <div class="summary btn btn-sm btn-square" role="button" tabindex="0">
    <svg class="w-5 h-5" viewBox="0 0 24 24">
      <g
        fill="none"
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
      >
        <path d="M19 4v16H7a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" />
        <path d="M19 16H7a2 2 0 0 0-2 2M9 8h6" />
      </g>
    </svg>
  </div>
  <!-- svelte-ignore a11y-no-noninteractive-tabindex -->
  <nav class="card card-fill menu menu-divide w-56 p-2" tabindex="0">
    <ul>
      {#each links as { href, name, icon }}
        <li>
          <a
            class="flex justify-between"
            class:active={$page.url.pathname.startsWith(href)}
            {href}
          >
            <div>
              <span>{icon}</span>
              <span class="ml-2">{name}</span>
            </div>
            <div>→</div>
          </a>
        </li>
      {/each}
    </ul>
  </nav>
</div>
