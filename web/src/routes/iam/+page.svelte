<script>
  import { goto } from "$app/navigation";
  import { page } from "$app/stores";
  import { Form, OTP } from "$lib";
  import { __user } from "../store";

  /** @type {import("$lib/types").GrantType} */
  let type = "PP";
  /** @type {string} */
  let user;
  /** @type {string} */
  let error;

  /** @param {CustomEvent<Error>} e  */
  function __failure(e) {
    error = e.detail.message;
  }

  /** @param {CustomEvent<import("$lib/types").Token>} e */
  async function __success(e) {
    const { searchParams, origin } = $page.url;
    let href = searchParams.get("redirect_to") || origin;
    /** @type {import("$lib/types").User=} */
    const user = await fetch("/_api/user").then((res) =>
      res.ok ? res.json() : undefined
    );
    if (user) __user?.set(user);
    await goto(href);
  }
</script>

<div
  class="h-full flex flex-col items-center justify-center md:flex-row md:justify-around"
>
  <div class="w-full p-4 md:p-0 max-w-80">
    <h2 class="mb-3 text-3xl font-semibold">Hello :)</h2>
    <Form align="full" on:success={__success}>
      <label>
        <p>选择登录方式</p>
        <select class="select" name="type" bind:value={type}>
          <option value="PP">用户密码</option>
          <option value="OTP">临时验证码</option>
          <option value="AK">API Key</option>
        </select>
      </label>
      {#if type != "AK"}
        <label>
          <input
            class="input"
            type="email"
            name="user"
            placeholder="E-mail Address"
            bind:value={user}
            required
          />
        </label>
      {/if}
      {#if type === "PP"}
        <label>
          <input
            class="input"
            type="password"
            name="pass"
            placeholder="Password"
            required
          />
        </label>
      {:else if type === "OTP"}
        <div class="flex gap-4">
          <label class="grow">
            <input
              class="input"
              type="text"
              name="pass"
              placeholder="OTP"
              required
            />
          </label>
          <OTP id={user} endpoint="/api/auth/otp" on:failure={__failure} />
        </div>
      {:else if type === "AK"}
        <div class="card card-warn p-2">
          WARN: This is experimental, unexpected issues may occur.
        </div>
        <label class="grow">
          <input
            class="input"
            type="text"
            name="pass"
            placeholder="Your API Key"
            required
          />
        </label>
      {/if}
      <svelte:fragment slot="submit">登录 / 注册</svelte:fragment>
    </Form>
    <p class="card p-2 text-intro mt-4">
      第一次登录会自动注册，登录即代表您已同意我们的
      <button type="button">《服务和隐私协议》</button>。
    </p>
  </div>
  <div class="p-4">
    <h1 class="text-2xl font-semibold">XXX XXXX XX 😇</h1>
  </div>
</div>
