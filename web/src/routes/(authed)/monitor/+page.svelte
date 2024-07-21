<svelte:head>
  <title>农艺专家 - 知识图谱</title>
</svelte:head>
<script>
    import { env } from "$env/dynamic/public";
</script>

<div class="h-full center">
  <iframe class="w-full h-full" src={env.PUBLIC_MONITOR_URL} title="g" frameborder="0"></iframe>
</div>
