<script>
  import { fetchEventSource } from "@microsoft/fetch-event-source";
  import { createEventDispatcher, onDestroy, onMount } from "svelte";
  import {
    __knowledge,
    __llm,
    __messages,
    __options,
    __services
  } from "./store";
  import { Markdown } from "$lib";

  /** @type {string} */
  export let url;

  const dispatch = createEventDispatcher();
  /** @type {AbortController} */
  let ctrl;
  let content = "";
  let error = false;

  async function __fetch() {
    const init = {
      knowledge: $__knowledge,
      services: $__services,
      llm: $__llm,
      options: $__options,
      messages: $__messages
    };

    ctrl = new AbortController();
    await fetchEventSource(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(init),
      signal: ctrl.signal,
      async onopen(res) {
        content = "";
      },
      onerror(err) {
        content = err.message;
        error = true;
        throw err;
      },
      onmessage(event) {
        const delta = JSON.parse(event.data);
        content += delta.content; // TODO: debounce?
      },
      onclose() {
        if (content.length > 0) {
          dispatch("stop", {
            role: "assistant",
            content: [
              {
                type: "text",
                text: content
              }
            ]
          });
        }
      }
    });
  }

  function __abort() {
    if (ctrl) ctrl.abort();
  }

  onMount(__fetch);
  onDestroy(__abort);
</script>

<div
  class="bubble bubble-l mt-1"
  class:bubble-info={!error}
  class:bubble-error={error}
>
  <div class="px-1">
    <Markdown text={content} />
  </div>
</div>
