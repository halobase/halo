<script>
  import { Icon } from "$lib";
  import { locale_datetime } from "$lib/utils/format";
  /** @type {import("$lib/types").Node[]} */
  export let nodes;
</script>

<ul class="grid gap-4">
  {#each nodes as node}
    <div class="card px-4 py-2 intro intro-xl">
      <div class="flex items-center justify-between">
        <h2>{node.id}</h2>
        <span class="card card-info px-2 py-1">运行中</span>
      </div>
      <div class="text-intro mb-4">
        更新 {locale_datetime(node.updated_at)}
      </div>
      <div class="flex gap-2">
        <button class="btn" type="button">
          <Icon icon="statistics" />
          <span class="ml-2">统计</span>
        </button>
        <button class="btn" type="button">
          <Icon icon="logs" />
          <span class="ml-2">日志</span>
        </button>
        <button class="btn" type="button">
          <Icon icon="play" />
          <span class="ml-2">停止</span>
        </button>
      </div>
    </div>
  {/each}
</ul>
