<script>
  let knowledge = "https://halobase.github.io/g";
  console.log(knowledge);
</script>

<svelte:head>
  <title>农艺专家 - 知识图谱</title>
</svelte:head>
<!-- <div class="relative h-full w-full"> -->

<div class="relative h-full center">
  <label class="absolute top-0 right-0 z-10">
    <select class="select" name="knowledge" bind:value={knowledge}>
      <option value="https://halobase.github.io/g">脆李</option>
      <option value="https://jimoins.github.io/orange">沃柑</option>
      <option value="https://jimoins.github.io/strawberry">草莓</option>
      <option value="https://jimoins.github.io/rice">水稻</option>
    </select>
  </label>
  <iframe class="w-full h-full" src={knowledge} title="g" frameborder="0"
  ></iframe>
</div>
<!-- </div> -->
