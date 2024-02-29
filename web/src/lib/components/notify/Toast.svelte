<script>
  import { fade } from "svelte/transition";
  import { dismiss } from "./store";
  import { Icon } from "../display";

  /** @type {import("./types").Toast} */
  export let toast;
</script>

<div
  class="card card-{toast.type} p-2 flex w-fit text-[#fff] bg-opacity-100"
  role="alert"
  transition:fade={{ duration: 200 }}
>
  <Icon icon={toast.type ?? "info"} />
  <div class="ml-2">
    {toast.message}
  </div>
  {#if toast.dismissable}
    <button
      class="text-{toast.type}-400 btn-ghost ml-4"
      title="close"
      on:click={() => dismiss(toast.id ?? 0)}
    >
      <svg
        class="w-5 h-5"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
      >
        <path
          fill="currentColor"
          d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z"
        />
      </svg>
    </button>
  {/if}
</div>
