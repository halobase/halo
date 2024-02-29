export function hexify(b: ArrayBuffer | string) {
  const a = typeof b === "string" ? new TextEncoder().encode(b) : b;
  return [...new Uint8Array(a)]
    .map(x => x.toString(16).padStart(2, '0'))
    .join('');
}


export async function digest(alg: AlgorithmIdentifier, b: ArrayBuffer | string) {
  const a = typeof b === "string" ? new TextEncoder().encode(b) : b;
  return await crypto.subtle.digest(alg, a);
}
