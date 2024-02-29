<script>
  import { Icon } from "$lib";
  import { __files } from "./store";
  import PDFIcon from "$lib/icons/pdf.svg";
  import { iec80000_bytes } from "$lib/utils/format";

  /** @param {number} i  */
  function __remove(i) {
    __files.update((files) => files.filter((_, index) => index !== i));
  }
</script>

{#if $__files.length > 0}
  <div class="card p-2 flex gap-2 rounded-xl">
    {#each $__files as file, i}
      <figure class="w-24 h-24 rounded-xl bg-fore bg-opacity-10 relative">
        {#if file.type.startsWith("image/")}
          <img
            class="rounded-lg w-full h-full object-cover"
            src={file.pre_signed_url}
            alt=""
          />
        {:else if file.type.startsWith("video/")}
          <div class="center overflow-hidden" title={file.name}>
            <Icon icon="video" size={42} />
            <p class="text-intro">{iec80000_bytes(file.size)}</p>
          </div>
        {:else if file.type === "application/pdf"}
          <div class="center cursor-pointer" title={file.name}>
            <img class="w-12" src={PDFIcon} alt="" />
            <p class="text-intro">{iec80000_bytes(file.size)}</p>
          </div>
        {/if}
        <figcaption>
          {#if file.state === "uploading"}
            上传中
          {:else if file.state === "failed_upload"}
            上传失败
          {:else if file.state === "uploaded"}
            <button
              class="text-error-400"
              type="button"
              on:click={() => __remove(i)}
            >
              移除
            </button>
          {/if}
        </figcaption>
      </figure>
    {/each}
  </div>
{/if}

<style lang="postcss">
  figcaption {
    @apply absolute bottom-0 w-full;
    @apply text-center text-sm text-[#fff];
    @apply bg-[#000] bg-opacity-70;
    @apply rounded-b-lg;
  }
</style>
