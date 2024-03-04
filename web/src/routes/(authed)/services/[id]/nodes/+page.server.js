export const actions = {
  create: async function (event) {
    const id = event.params.id;
    const form = await event.request.formData();
    const urls = Array.from(form).filter(([k]) => k.startsWith("node-")).map(([, v]) => v);
    const responses = await Promise.all(urls.map(
      url => event.fetch(`/_api/services/${id}/nodes`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ url, tags: [] }),
      })
    ));
    return await Promise.all(responses.filter(async res => {
      if (!res.ok) {
        console.warn(`[${res.status}] ${await res.text()}`);  // TODO: do it right
      }
      return res.ok;
    }).map(async res => await res.json()));
  },
};
