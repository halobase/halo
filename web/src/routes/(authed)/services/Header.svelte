<script>
  import { Icon, PageHeader } from "$lib";
  import New from "./New.svelte";
</script>

<PageHeader responsive>
  <svelte:fragment slot="title">
    数字模型
  </svelte:fragment>
  <svelte:fragment slot="intro">
    <h1>数字模型</h1>
    <p>
      我们针对不同作物提供不同的模型服务，一次调用的费用为模型单价乘该次调用的请求数据大小。
    </p>
  </svelte:fragment>
  <svelte:fragment>
    <New />
    <label class="btn 2xl:hidden" for="services">
      <Icon icon="filter" size={18} />
      <span class="ml-1">过滤</span>
    </label>
  </svelte:fragment>
</PageHeader>
