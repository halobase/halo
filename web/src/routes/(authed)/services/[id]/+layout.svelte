<script>
  import { page } from "$app/stores";
  import { PageHeader } from "$lib";
  export let data;

  const { user } = data;

  const links = [{ id: "docs", name: "文档" }];
  if (user?.id === data.service.user) {
    links.push({ id: "settings", name: "设置" });
    links.push({ id: "nodes", name: "节点" });
  }
</script>

<div class="border-b border-fore border-opacity-10">
  <div class="container container-xl pb-0">
    <PageHeader>
      <svelte:fragment slot="title">
        {data.service.icon}
        {data.service.schema?.info?.title}
      </svelte:fragment>
      <svelte:fragment slot="intro">
        <p></p>
      </svelte:fragment>
      <svelte:fragment>
        <nav class="tab">
          {#each links as link}
            {@const href = `/services/${data.service.id}/${link.id}`}
            <a
              class="min-w-24"
              class:active={$page.url.pathname.startsWith(href)}
              {href}
            >
             <div>{link.name}</div>
            </a>
          {/each}
        </nav>
      </svelte:fragment>
    </PageHeader>
  </div>
</div>
<slot />
