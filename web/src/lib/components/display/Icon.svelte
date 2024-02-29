<!-- 
  Token from
  https://github.com/sveltejs/site-kit/blob/master/packages/site-kit/src/lib/components/Icon.svelte 
-->

<script>
  /** @type {string} */
  export let icon;
  /** @type {string | number} */
  export let size = 20;
</script>

<svg width={size} height={size}>
  <use xlink:href="#{icon}" />
</svg>

<style>
  svg {
    position: relative;
    overflow: hidden;
    vertical-align: middle;
    object-fit: contain;
    -o-object-fit: contain;
    transform-origin: center center;
    -webkit-transform-origin: center center;
    stroke: currentColor;
    stroke-width: 2;
    stroke-linecap: round;
    stroke-linejoin: round;
    fill: none;
  }
</style>
