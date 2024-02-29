<script>
  import { Dialog, Form } from "$lib";
  let enable = false;
</script>

<button class="btn btn-alpha" type="button" on:click={() => (enable = !enable)}>
  + 新建
</button>

<Dialog bind:enable title="Create a service">
  <Form>
    <label>
      <input
        class="input"
        type="text"
        name="name"
        placeholder="Name"
        required
      />
    </label>
  </Form>
</Dialog>
