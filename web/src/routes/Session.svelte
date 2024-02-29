<script>
  import { page } from "$app/stores";
  import Card from "./Card.svelte";
  import { __user } from "./store";
</script>

{#if $__user}
  <div class="details details-end">
    <div class="summary text-3xl" role="button" tabindex="0">
      <div class="relative">
        {$__user.icon}
        <span class="absolute top-1 right-1 dot dot-info" />
      </div>
    </div>
    <!-- svelte-ignore a11y-no-noninteractive-tabindex -->
    <div class="card card-fill w-64" tabindex="0">
      <Card user={$__user} />
      <nav class="nav">
        <div class="!py-0"></div>
        <a href="/keys">API Keys</a>
        <a
          class="flex text-error-500"
          data-sveltekit-preload-data="off"
          href="/iam?action=signout"
        >
          退出登录
        </a>
      </nav>
    </div>
  </div>
{:else}
  <a class="btn" href="/iam?redirect_to={$page.url.pathname}">登录</a>
{/if}
