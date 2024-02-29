<script>
  /** @type {import("$lib/types").User} */
  export let user;
</script>

<div class="flex gap-2 p-4">
  <div class="text-5xl">{user.icon}</div>
  <div>
    <h6 class="mb-1">{user.name ?? user.email}</h6>
    <span class="card card-info inline-block px-2 py-0.5">Free</span>
  </div>
</div>

