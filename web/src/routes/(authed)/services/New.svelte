<script>
  import { goto } from "$app/navigation";
  import { Form } from "$lib";

  /** @param {CustomEvent<import("$lib/types").Service>} e */
  async function __create(e) {
    await goto(`/services/${e.detail.id}/settings`);
  }
</script>

<Form action="?/create" on:success={__create}>
  <svelte:fragment slot="submit">+ 新建</svelte:fragment>
  <svelte:fragment slot="pending">创建中</svelte:fragment>
</Form>
