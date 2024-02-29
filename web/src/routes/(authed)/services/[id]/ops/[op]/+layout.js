export async function load(event) {
  const { op } = event.params;
  return {
    op,
  };
}