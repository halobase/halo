<script>
  import { GoBack } from "../action";
  export let responsive = false;
</script>

<header>
  <nav class="grid grid-cols-4 items-center mb-4">
    <div>
      <GoBack />
    </div>
    <div class="text-center font-semibold col-span-2">
      <slot name="title">Heading</slot>
    </div>
    <div class="flex justify-end">
      <slot name="action" />
    </div>
  </nav>
  <div
    class="flex flex-col justify-between gap-4"
    class:xl:flex-row={responsive}
  >
    <div class="intro intro-2xl">
      <slot name="intro">
        <p>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Veritatis
          provident labore reprehenderit nihil consectetur accusamus. Nihil at
          autem itaque unde accusamus quaerat suscipit earum et optio. Harum
          consectetur nemo minus.
        </p>
      </slot>
    </div>
    <div class="flex items-center gap-2">
      <slot />
    </div>
  </div>
</header>
