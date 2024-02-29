<script>
  import { Clipboard, Dialog, Form } from "$lib";
  import List from "./List.svelte";

  export let data;

  $: keys = data.keys;
  let scopes = data.scopes;
  let enable = false;
  let created = "";

  function __toggle() {
    enable = !enable;
  }

  /** @param {CustomEvent<typeof keys[0]>} e  */
  function __create(e) {
    const key = e.detail;
    created = key.key_onetime ?? "";
    __toggle();
  }
</script>

<svelte:head>
  <title>API Keys \ Halo</title>
  <meta name="description" content="API Keys \ Halo " />
</svelte:head>

<div class="container container-lg lg:pt-8 2xl:pt-16">
  <div class="flex flex-col justify-between gap-6 md:flex-row 2xl:mb-6">
    <div class="intro intro-2xl">
      <h1>API Keys</h1>
      <p>
        API keys can be used to authenticate server-to-server communication.
      </p>
      <p>
        Halo does not save your API keys in plain text, so you have to generate
        new API keys if losing any, and applications using the lost key has to
        be updated as well. Learn more about the
        <a
          class="underline"
          href="https://en.wikipedia.org/wiki/API_key"
          target="_blank"
          rel="noopener noreferrer">API key</a
        >.
      </p>
    </div>
    <div>
      <button class="btn btn-alpha" type="button" on:click={__toggle}>
        + New
      </button>
    </div>
  </div>
  {#if created}
    <div class="card card-info p-4">
      <p>Successfully generated a new API key!</p>
      <p>
        Please copy the API key at once, you will NOT be enable to see it again,
        and have to generate a new one if losing it.
      </p>
      <div class="py-1"></div>
      <Clipboard value={created} />
    </div>
  {/if}
  <List {keys} />
</div>

<Dialog bind:enable title="Generate an API key">
  <Form action="?/create" on:success={__create}>
    <label>
      <p>Purpose of the new API key.</p>
      <input class="input" type="text" name="name" value="API Key" required />
    </label>
    <div class="group">
      <p>Scopes servers with the new API key has access to.</p>
      <div class="flex flex-wrap gap-4 mt-2">
        {#each scopes as scope}
          <label class="checkbox checkbox-alpha checkbox-sm">
            <input type="checkbox" name="scope" value={scope} />
            {scope}
          </label>
        {/each}
      </div>
    </div>
    <svelte:fragment slot="submit">Generate</svelte:fragment>
  </Form>
</Dialog>
