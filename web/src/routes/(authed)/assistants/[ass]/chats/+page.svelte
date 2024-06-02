<script>
  import { goto } from "$app/navigation";
  import { Form, PageHeader } from "$lib";
  import List from "./List.svelte";
  export let data;
  const title = `与 ${data.assistant.name} 的历史对话`;

  /** @param {CustomEvent<import("$lib/types").Chat>} e  */
  async function __create(e) {
    await goto(`/assistants/${data.assistant.id}/chats/${e.detail.id}`);
  }
</script>

<svelte:head>
  <title>{title}</title>
  <meta name="description" content={title} />
</svelte:head>

<div class="container container-lg">
  <PageHeader responsive>
    <svelte:fragment slot="title">{title}</svelte:fragment>
    <svelte:fragment slot="intro">
      <p></p>
    </svelte:fragment>
    <svelte:fragment>
      <Form
        action="/assistants/{data.assistant.id}/chats?/create"
        align="left"
        on:success={__create}
      >
        <svelte:fragment slot="submit">+ 新对话</svelte:fragment>
      </Form>
    </svelte:fragment>
  </PageHeader>
  <List chats={data.chats} assistant={data.assistant} />
</div>
