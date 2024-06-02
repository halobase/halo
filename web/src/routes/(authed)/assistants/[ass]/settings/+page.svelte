<script>
  import { PageHeader } from "$lib";
  import Danger from "./Danger.svelte";
  import Extension from "./Extension.svelte";
  import General from "./General.svelte";
  import LLM from "./LLM.svelte";

  export let data;
  const title = data.assistant.name;
</script>

<svelte:head>
  <title>{title}</title>
  <meta name="description" content={title} />
</svelte:head>

<div class="container container-lg">
  <PageHeader responsive>
    <svelte:fragment slot="title">{title}</svelte:fragment>
    <svelte:fragment slot="intro">
      <p></p>
    </svelte:fragment>
    <svelte:fragment></svelte:fragment>
  </PageHeader>
  <div class="container container-md">
    <General assistant={data.assistant} />
    <LLM assistant={data.assistant} />
    <Extension assistant={data.assistant} services={data.services} />
    <Danger assistant={data.assistant} />
  </div>
</div>
