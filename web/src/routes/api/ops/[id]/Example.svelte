<script>
  import { Codeblock } from "$lib";

  /** @type {import("$lib/types").Operation} */
  export let op;

  const codes = [
    {
      lang: "JavaScript",
      content: `import { Halo } from "halo";
    
const halo = new Halo(api_key="xxxxxxxxx");
const updated = halo.request("PUT /services/0", {
  icon: "🫐",
  name: "example_service",
  schema: {
    openapi: "3.0.3",
    info: {
      title: "示例服务",
      version: "0.0.1"
    },
  }
});
console.log(updated);`
    }
  ];
</script>

<div class="flex flex-col gap-4">
  <Codeblock {codes} title="Example" />
</div>
