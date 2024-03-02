<script>
  import Delete from "./Delete.svelte";
  import Level from "./Level.svelte";
  import Readme from "./Readme.svelte";
  import Schema from "./Schema.svelte";

  export let data;
</script>

<main class="container container-md">
  <div></div>
  <Readme service={data.service} />
  <Schema service={data.service} />
  <div class="intro intro-xl">
    <h2>危险操作</h2>
  </div>
  <nav class="card card-list border-error-500">
    <Level service={data.service} />
    <Delete service={data.service} />
  </nav>
</main>
