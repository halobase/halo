<script>
  import { PageHeader } from "$lib";
  import Fillters from "./Fillters.svelte";
  import List from "./List.svelte";
  import New from "./New.svelte";
  export let data;
</script>

<svelte:head>
  <title>智能助手 \ Halo</title>
  <meta name="description" content="智能助手 \ Halo " />
</svelte:head>

<main class="container container-xl">
  <PageHeader>
    <svelte:fragment slot="title">智能助手</svelte:fragment>
    <svelte:fragment slot="intro">
      <h1>智能助手</h1>
    </svelte:fragment>
    <svelte:fragment>
      <div class="flex gap-2 w-full lg:w-[32rem]">
        <New />
        <Fillters />
      </div>
    </svelte:fragment>
  </PageHeader>
  <List assistants={data.assistants} />
</main>
