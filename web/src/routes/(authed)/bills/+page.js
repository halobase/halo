export async function load(event) {
    /** @type {Array<import("$lib/types").Bill>} */
    const bills = await event.fetch("/_api/bill/personal")
      .then(res => res.json());
    bills.sort((b, a) => (new Date(a.created_at ?? 0)).getTime()
    - (new Date(b.created_at ?? 0)).getTime());
  return {
    bills
  };
}
