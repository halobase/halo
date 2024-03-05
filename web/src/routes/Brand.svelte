<script>
  import Logo from "./logo.png";
</script>

<div class="flex items-center gap-2">
  <label class="btn btn-sm btn-square sm:hidden" for="app">
    <svg class="w-5 h-5" viewBox="0 0 24 24">
      <path
        fill="none"
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M4 6h16M4 12h16M4 18h12"
      />
    </svg>
  </label>
  <a class="text-nowrap" href="/">
    <h1 class="text-3xl font-extrabold flex gap-2 items-center">
      <img class="h-8 w-10" src={Logo} alt="">
      <span class="hidden sm:block">Halo</span>
    </h1>
  </a>
</div>
