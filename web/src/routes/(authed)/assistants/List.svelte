<script>
  import { Icon } from "$lib";

  /** @type {import("$lib/types").Assistant[]} */
  export let assistants;
</script>

<div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
  {#each assistants as ass}
    <div class="card p-2 flex gap-2">
      <div class="text-4xl">{ass.icon}</div>
      <div class="intro">
        <h3>{ass.name}</h3>
        <p>{ass.description ?? ""}</p>
        <div class="flex gap-2">
          <a class="btn" href="/knowledge/{ass.knowledge}">
            <Icon icon="graph" />
            <span class="ml-2">知识</span>
          </a>
          <a class="btn" href="/assistants/{ass.id}/chats">
            <Icon icon="message" />
            <span class="ml-2">对话</span>
          </a>
        </div>
      </div>
    </div>
  {/each}
</div>
