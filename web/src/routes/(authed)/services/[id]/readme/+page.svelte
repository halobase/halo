<script>
  import { Markdown } from "$lib";

  export let data;
  const { service } = data;
</script>

<main class="container container-xl">
  <div class="flex gap-8">
    <Markdown text={service.readme} />
    <div class="hidden xl:block w-80">
      
    </div>
  </div>
</main>
