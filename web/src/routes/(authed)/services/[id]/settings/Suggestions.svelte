<script>
  import { Icon } from "$lib";

  /** @type {import("$lib/types").Service} */
  export let service;
  /** @type {import("$lib/types").Node[]} */
  export let nodes;
</script>

<div>
  {#if nodes.length === 0}
    <div class="card card-warn px-4 py-2">
      <div class="flex items-center gap-4">
        <Icon icon="info" />
        当前模型无运行中的节点
        <a class="btn btn-light" href="/services/{service.id}/nodes">去添加 →</a>
      </div>
    </div>
  {/if}
</div>
