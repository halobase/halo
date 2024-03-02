<script>
  import { Markdown } from "$lib";

  export let data;
</script>

<div class="px-6 pb-6">
  <div class="flex gap-8">
    <Markdown text={data.service.readme ?? ""} />
    <div class="hidden xl:block w-80"></div>
  </div>
</div>
