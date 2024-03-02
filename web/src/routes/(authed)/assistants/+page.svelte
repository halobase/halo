<script>
  import { PageHeader } from "$lib";
  import Fillters from "./Fillters.svelte";
  import List from "./List.svelte";
  import New from "./New.svelte";
  export let data;
</script>

<svelte:head>
  <title>数字农艺专家 | 精准农业数字模型 AI 服务平台</title>
  <meta name="description" content="数字农艺专家 | 精准农业数字模型 AI 服务平台 " />
</svelte:head>

<main class="container container-xl">
  <PageHeader>
    <svelte:fragment slot="title">数字农艺专家</svelte:fragment>
    <svelte:fragment slot="intro">
      <p></p>
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
