export async function load(event) {
  const { id } = event.params;
  return {
    id,
  }
}