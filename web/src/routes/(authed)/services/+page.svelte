<script>
  import Header from "./Header.svelte";
  import List from "./List.svelte";
  import Sidebar from "./Sidebar.svelte";
  import { filter_intersect, filter_union } from "./lib";
  import { __query } from "./store";

  export let data;
  const all = data.services;
  let services = all;
  let union = false;

  __query.subscribe(function ({ keyword, tags }) {
    let S = all.filter(function ({ schema }) {
      return keyword ? schema.info.title.includes(keyword) : true;
    });
    // TODO: use bitwise operations
    S = S.filter(function ({ schema }) {
      if (!tags || !tags.length) return true;
      if (tags.length > (schema.tags?.length ?? 0)) return false;
      const B = schema.tags ?? [];
      return union ? filter_union(tags, B) : filter_intersect(tags, B);
    });
    services = S;
  });
</script>

<svelte:head>
  <title>数字模型 \ Halo</title>
  <meta name="description" content="数字模型 \ Halo " />
</svelte:head>

<div class="drawer drawer-r drawer-s-2xl">
  <input type="checkbox" id="services" />
  <main class="container container-xl">
    <Header />
    <!-- <QueryKeyword on:query={__query} /> -->
    <List {services} />
  </main>
  <aside class="overflow-y-hidden">
    <label for="services" />
    <Sidebar {services} />
  </aside>
</div>
