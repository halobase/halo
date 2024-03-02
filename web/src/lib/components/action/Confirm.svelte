<script>
  import Dialog from "./Dialog.svelte";
  import { Form } from "../form";

  /** @type {boolean} */
  export let enable;
  /** @type {string} */
  export let action;
  /** @type {import("$lib/tailwind/types").Variants} */
  export let color = "alpha";
  export let title = "Please confirm";
  export let confirm = "Confirm";
</script>

<Dialog bind:enable {title}>
  <div class="w-64 sm:w-96">
    <slot name="intro" />
    <div class="mt-4">
      <Form {action} {color} on:failure on:success>
        <slot />
        <svelte:fragment slot="submit">{confirm}</svelte:fragment>
      </Form>
    </div>
  </div>
</Dialog>
