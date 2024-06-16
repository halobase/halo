<script>
  import { afterUpdate } from "svelte";
  import Content from "./Content.svelte";
  import Completion from "./Completion.svelte";
  import { __messages } from "./store";

  /** @type {import("$lib/types").Assistant} */
  export let assistant;

  /** @type {string} */
  export let url;

  /** @type {"left" | "between"} */
  export let align = "between";

  /** @type {Element} */
  let ref;

  /** @param {Element} e  */
  function scroll(e) {
    e.scroll({
      top: e.scrollHeight,
      behavior: "smooth"
    });
  }

  /**
   * @param {string} role
   * @param {"left" | "between"} align
   */
  function should_align_right(role, align) {
    return role === "user" && align === "between";
  }

  afterUpdate(() => scroll(ref));
</script>

<ul
  class="flex flex-col gap-2 lg:gap-4 h-full sb-none overflow-y-auto"
  bind:this={ref}
>
  {#each $__messages as msg, i}
    {@const { role } = msg}
    {#if role === "system"}
      <li class="text-center text-intro">You are good to go.</li>
    {:else}
      <li
        class="w-5/6 flex gap-2"
        class:self-end={should_align_right(role, align)}
        class:flex-row-reverse={should_align_right(role, align)}
      >
        <div class="text-2xl sm:text-3xl">
          {#if role === "assistant"}
            <a href="/assistants/{assistant.id}/settings">{assistant.icon}</a>
          {:else}
            🙂
          {/if}
        </div>
        <div
          class="bubble mt-1"
          class:bubble-l={role === "assistant"}
          class:bubble-r={role === "user"}
          class:bubble-info={role === "assistant"}
          class:bubble-alpha={role === "user"}
        >
          <Content {msg} />
        </div>
      </li>
    {/if}
    {@const n = $__messages.length}
    {#if i === n - 1 && role === "user"}
      <li class="w-5/6 flex gap-2 mb-2">
        <div class="text-3xl">{assistant.icon}</div>
        <Completion {url} on:stop />
      </li>
    {/if}
  {/each}
</ul>
