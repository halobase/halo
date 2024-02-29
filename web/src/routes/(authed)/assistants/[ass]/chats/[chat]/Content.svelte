<script>
  import { Markdown } from "$lib";
  import { iec80000_bytes } from "$lib/utils/format";
  import PDFIcon from "$lib/icons/pdf.svg";

  /** @type {import("$lib/types").Message} */
  export let msg;
</script>

<div class="flex flex-col gap-2">
  {#each msg.content as c}
    {#if c.type === "text"}
      <div class="px-1">
        <Markdown text={c.text} />
      </div>
    {:else if c.type === "file_url"}
      <figure>
        {#if c.file_url.mime_type.startsWith("image/")}
          <img
            class="max-w-32 lg:max-w-40 rounded-xl"
            src={c.file_url.url}
            alt=""
          />
        {:else if c.file_url.mime_type.startsWith("video/")}
          <video class="rounded-xl" controls muted>
            <source src={c.file_url.url} type={c.file_url.mime_type} />
            <track kind="captions" />
          </video>
        {:else if c.file_url.mime_type === "application/pdf"}
          <a class="card p-2 flex" href={c.file_url.url}>
            <img class="w-12" src={PDFIcon} alt="">
            <div class="intro ml-2 min-w-28 max-w-80">
              <h6 class="text-truncated">{c.file_url.name}</h6>
              <p>{iec80000_bytes(c.file_url.size ?? 0, 1, true)}</p>
            </div>
          </a>
        {/if}
      </figure>
    {/if}
  {/each}
  <!-- <div class="flex">
    <button class="btn btn-xs btn-ghost text-intro" type="button">
      <Icon icon="copy" size={16} />
      <span class="ml-2">复制</span>
    </button>
  </div> -->
</div>
