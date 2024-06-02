/**
 * Taken from https://stackoverflow.com/questions/40031688/javascript-arraybuffer-to-hex
 * @param {ArrayBuffer} b 
 * @returns {string}
 */
export function hexify(b) {
  return [...new Uint8Array(b)]
    .map(x => x.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * @template T
 * @template {import("./types").ResponseError} E
 * @param {Response} res 
 * @returns {Promise<import("./types").ResponseDeserialized<T, E>>}
 */
export async function deserialize_response(res) {
  const type = res.headers.get("Content-Type") || "text/plain";
  const body = type.startsWith("application/json") ?
    await res.json() : await res.text();
  if (res.ok) {
    return [body, undefined];
  }
  return [
    undefined,
    typeof body === "string" ? { message: body } : body
  ]
}
