<script>
  import { Dialog, Icon, notify } from "$lib";
  import { __options } from "./store";
  /** @type {HTMLFormElement} */
  let form;
  let enable = false;

  let options = {
    retrieval: false,
  }

  /** @param {SubmitEvent} e */
  function __submit(e) {
    // const data = new FormData(form, e.submitter);
    // __options.set({
    //   retrieval: !!get(data, "retrieval")
    // });
    __options.set(options);
    enable = false;
    notify({ message: "已保存" });
  }
</script>

<button
  class="btn btn-sm btn-ghost btn-square"
  title="options"
  type="button"
  on:click={() => (enable = true)}
>
  <Icon icon="settings" />
</button>

<Dialog bind:enable title="选项">
  <form
    class="form"
    bind:this={form}
    on:submit|preventDefault={__submit}
  > 
    <p class="text-intro">更改只对本次对话有效</p>
    <div>
      <label class="flex justify-between">
        <h3>使用知识库</h3>
        <input
          class="switch switch-alpha"
          type="checkbox"
          name="retrieval"
          title="使用知识库"
          bind:checked={options.retrieval}
        />
      </label>
      <p class="text-intro mt-1"></p>
    </div>
    <div class="flex justify-end">
      <button class="btn btn-alpha" type="submit">保存</button>
    </div>
  </form>
</Dialog>
