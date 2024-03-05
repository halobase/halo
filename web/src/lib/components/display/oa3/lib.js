/**
 * @template {import("./types").DereffableObject} T
 * @param {string} ref 
 * @param {any} [root] 
 * @returns {T=}
 */
export function deref(ref, root) {
  const [_, k0, k1, k2] = /#\/(.+)\/(.+)\/(.+)$/.exec(ref) ?? [];
  if (root && k0 && k1 && k2) {
    return root[k0][k1][k2];
  }
  return undefined;
}


/**
 * @template {import("./types").DereffableObject} T
 * @param {T | import("openapi3-ts/oas30").ReferenceObject} [obj] 
 * @param {any} [root] 
 * @returns {T=}
 */
export function deref_if_needed(obj, root) {
  if (!obj) return obj;
  return "$ref" in obj ? deref(obj.$ref, root) : obj;
}
