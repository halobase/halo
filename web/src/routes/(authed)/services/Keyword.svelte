<script>
  import { debounce } from "$lib/utils/function";
  import { __query } from "./store";

  /** @param {{ target: { value: string } }} e */
  function __input(e) {
    __query.set({ keyword: e.target.value });
  }
</script>

<label>
  <input
    class="input"
    type="text"
    placeholder="关键字搜索"
    on:input={debounce(__input, 1000)}
  />
</label>
