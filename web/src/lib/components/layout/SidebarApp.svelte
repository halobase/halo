<script>
  export let id = "app";
  export let title = "sidebar";
  /** @type {"normal" | "relaxed" | "loose"} */
  export let sidebar = "normal";
</script>

<div class="drawer drawer-l drawer-s drawer-scale">
  <input type="checkbox" {id} {title} />
  <aside>
    <label for={id} />
    <div
      class="flex flex-col max-w-80 sm:max-w-fit p-3 md:p-4 border-r border-fore border-opacity-15"
    >
      <div
        class="sm:w-40 xl:w-64 2xl:w-80 grow"
        class:md:w-48={sidebar === "normal"}
        class:lg:w-56={sidebar === "normal"}
        class:2xl:w-64={sidebar === "normal"}
        class:md:w-56={sidebar === "relaxed"}
        class:lg:w-64={sidebar === "relaxed"}
        class:2xl:w-72={sidebar === "relaxed"}
        class:md:w-64={sidebar === "loose"}
        class:xl:w-72={sidebar === "loose"}
        class:2xl:w-80={sidebar === "loose"}
      >
        <slot name="sidebar">sidebar</slot>
      </div>
    </div>
  </aside>
  <main class="flex flex-col w-full sb sb-sm">
    <slot name="route" />
    <slot name="footer" />
  </main>
</div>
