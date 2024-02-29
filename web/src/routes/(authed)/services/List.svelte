<script>
  /** @type {Array<import("$lib/types").Service>} */
  export let services;
</script>

<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-4">
  {#each services as { id, icon, schema }}
    <div class="card p-3 flex gap-2">
      <div class="text-2xl md:text-3xl">{icon}</div>
      <div class="intro">
        <h3>
          <a class="hover:text-alpha-400" href="/services/{id}/readme">
            {schema.info.title}
          </a>
        </h3>
        <p>{schema.info.description ?? "-"}</p>
        <div class="flex gap-2 flex-wrap">
          {#each schema.tags ?? [] as { name }}
            <span class="badge text-xs">{name}</span>
          {/each}
        </div>
      </div>
    </div>
  {/each}
</div>
