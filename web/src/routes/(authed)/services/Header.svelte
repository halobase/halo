<script>
  import { Icon, PageHeader } from "$lib";
  import New from "./New.svelte";
</script>

<PageHeader responsive>
  <svelte:fragment slot="title">
    数字模型
  </svelte:fragment>
  <svelte:fragment slot="intro">
    <p></p>
  </svelte:fragment>
  <svelte:fragment>
    <New />
    <label class="btn 2xl:hidden" for="services">
      <Icon icon="filter" size={18} />
      <span class="ml-1">过滤</span>
    </label>
  </svelte:fragment>
</PageHeader>
