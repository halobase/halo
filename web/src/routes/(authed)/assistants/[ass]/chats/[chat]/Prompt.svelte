<script>
  import { debounce } from "$lib/utils/function";
  import { createEventDispatcher } from "svelte";
  import Controller from "./Controller.svelte";
  import { __files } from "./store";
  import FilePreview from "./FilePreview.svelte";
  export let disabled = false;

  const dispatch = createEventDispatcher();
  let value = "";

  function clear() {
    value = "";
    __files.set([]);
  }

  function __submit() {
    if (disabled || (!value && !$__files)) {
      return;
    }

    /** @type {import("$lib/types").MessageContent[]} */
    const content = [];
    if ($__files) {
      for (const file of $__files) {
        content.push({
          type: "file_url",
          file_url: {
            url: file.pre_signed_url,
            name: file.name,
            mime_type: file.type,
            size: file.size
          }
        });
      }
    }
    if (value) {
      content.push({
        type: "text",
        text: value.trim()
      });
    }
    if (content.length > 0) {
      dispatch("send", {
        role: "user",
        content
      });
      clear();
    }
  }

  /** @param {KeyboardEvent} e  */
  function __keypress(e) {
    if (e.key === "Enter" && !e.ctrlKey && !e.shiftKey) {
      return __submit();
    }
  }
</script>

<div>
  <FilePreview />
  <form class="contents mt-2" on:submit|preventDefault={__submit}>
    <div class="flex items-center justify-between gap-4 my-2">
      <Controller />
      <button class="btn btn-alpha btn-sm" type="submit" {disabled}>发送</button>
    </div>
    <textarea
      class="block input p-2 h-10 sm:h-20 sb sb-sm"
      placeholder="Enter 发送, Shift + Enter 换行"
      on:keypress={debounce(__keypress, 200)}
      bind:value
    />
  </form>
</div>
