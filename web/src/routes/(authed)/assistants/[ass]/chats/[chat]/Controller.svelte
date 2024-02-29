<script>
  import { Icon } from "$lib";
  import FileInput from "./FileInput.svelte";
  import Options from "./Options.svelte";
</script>

<div class="flex gap-2">
  <ul class="card flex">
    <li>
      <FileInput accept="image/*" icon="image" title="添加图片" />
    </li>
    <li>
      <FileInput accept="video/*" icon="video" title="添加视频" />
    </li>
    <li>
      <FileInput accept="application/pdf" icon="pdf" title="添加文件" />
    </li>
    <li>
      <button class="btn btn-sm btn-ghost btn-square" title="microphone" type="button">
        <Icon icon="microphone" />
      </button>
    </li>
  </ul>
  <ul class="card flex">
    <li>
      <Options />
    </li>
    <li class="xl:hidden">
      <label
        class="btn btn-sm btn-ghost btn-square"
        title="history"
        for="chats"
      >
        <Icon icon="history" />
      </label>
    </li>
  </ul>
</div>
