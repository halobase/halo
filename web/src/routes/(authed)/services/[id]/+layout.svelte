<script>
  import { page } from "$app/stores";
  import { PageHeader } from "$lib";
  export let data;

  const { service } = data;

  const links = [
    { id: "readme", name: "Overview" },
    { id: "ops", name: "API Reference" }
  ];
</script>

<div class="border-b border-fore border-opacity-10">
  <div class="container container-xl pb-0">
    <PageHeader>
      <svelte:fragment slot="title">{service.schema.info.title}</svelte:fragment>
      <svelte:fragment slot="intro">
        <h1 class="!mb-0">{service.icon} {service.schema.info.title}</h1>
      </svelte:fragment>
      <svelte:fragment>
        <nav class="tab">
          {#each links as link}
            {@const href = `/services/${service.id}/${link.id}`}
            <a
              class="min-w-32"
              class:active={$page.url.pathname.startsWith(href)}
              {href}>{link.name}</a
            >
          {/each}
        </nav>
      </svelte:fragment>
    </PageHeader>
  </div>
</div>
<slot />
