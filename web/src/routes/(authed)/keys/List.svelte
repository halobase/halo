<script>
  import { Confirm } from "$lib";
  import { locale_datetime } from "$lib/utils/format";

  /** @type {import("$lib/types").Key[]} */
  export let keys;

  /** @type {typeof keys[0]} */
  let dying;
  let enable = false;

  /** @param {typeof keys[0]} key  */
  function format(key) {
    if (!key) return "";
    const { id, prefix, secret_truncated } = key;
    return `${prefix}-${id?.slice(4, 8) ?? ""}${"*".repeat(6)}${secret_truncated}`;
  }

  function __delete() {
    enable = false;
  }
</script>

<div class="card overflow-x-auto">
  <table class="table table-fixed table-outline table-nowrap">
    <thead>
      <tr>
        <th class="w-10"></th>
        <th>Key</th>
        <th>Name</th>
        <th class="cell-md w-24">Scopes</th>
        <th class="cell-lg">Accessed</th>
        <th class="w-10 sm:w-20"></th>
      </tr>
    </thead>
    <tbody>
      {#each keys as key}
        <tr>
          <td class="pr-0">🗝️</td>
          <td>{format(key)}</td>
          <td>{key.name}</td>
          <td class="cell-md">{key.scopes.length}</td>
          <td class="cell-lg"
            >{key.accessed_at ? locale_datetime(key.accessed_at) : "-"}</td
          >
          <td class="px-0 text-center">
            <button
              class="btn btn-ghost btn-error btn-xs"
              type="button"
              on:click={() => {
                dying = key;
                enable = true;
              }}
            >
              <span class="sm:hidden">⨉</span>
              <span class="hidden sm:block">Revoke</span>
            </button>
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
  {#if keys.length === 0}
    <div class="text-center text-intro py-3">Empty</div>
  {/if}
</div>

<Confirm
  color="error"
  action="?/delete"
  title="Confirm to revoke"
  bind:enable
  on:success={__delete}
>
  <p class="text-sm" slot="extra">
    Are you sure to revoke <span class="badge">{format(dying)}</span> ? This
    operation can <strong>NOT</strong> be undone.
  </p>
  <input class="hidden" type="text" name="id" value={dying?.id} />
</Confirm>
