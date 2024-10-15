<script>
  import { locale_datetime } from "$lib/utils/format";
  export let data;
  let bills = data.bills
  // @ts-ignore
  function format(bill) {
    if (!bill) return "";
    const { key, prefix, secret_truncated } = bill;
    return `${prefix}-${key?.slice(4, 8) ?? ""}${"*".repeat(6)}${secret_truncated}`;
  }
  </script>

<div class="container container-lg lg:pt-8 2xl:pt-16">
  <div class="flex flex-col justify-between gap-6 md:flex-row 2xl:mb-6">
  </div>
  <div class="card overflow-x-auto">
    <table class="table table-fixed table-outline table-nowrap">
      <thead>
        <tr>
          <th class="w-10"></th>
          <th>账期</th>
          <th class="cell-lg">账单id</th>
          <th >模型产品名</th>
          <th class="cell-lg">Key</th>
          <th class="w-20">消费金额</th>
          <th class="w-20">余额</th>
        </tr>
      </thead>
      <tbody>
        {#each bills as bill}
          <tr>
            <td class="pr-0">💴</td>
            <td >{bill.created_at ? locale_datetime(bill.created_at) : "-"}</td>
            <td class="cell-lg">{ bill.id.replace(/.*:/, "")}</td>
            <td>{bill.service}</td>
            <td class="cell-lg">{format(bill)}</td>
            <td >{bill.amount}</td>
            <td >{bill.balance}</td>
          </tr>
        {/each}
      </tbody>
    </table>
    {#if bills.length === 0}
      <div class="text-center text-intro py-3">Empty</div>
    {/if}
  </div>
</div>


