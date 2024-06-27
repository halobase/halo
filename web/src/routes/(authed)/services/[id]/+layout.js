export async function load(event) {
  const id = event.params.id;
  /** 
   * @type {[
   *   import("$lib/types").Service,
   *   import("$lib/types").Node[]
   * ]} 
   */
  const [service, nodes] = await Promise.all([
    event.fetch(`/_api/services/${id}`)
      .then(res => res.json()),
    event.fetch(`/_api/services/${id}/nodes`)
      .then(res => res.json()),
  ]);
  if(!service.schema)  service.schema = JSON.parse(service.openapi); 
  return {
    service,
    nodes,
  }
}
