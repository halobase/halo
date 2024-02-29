/**
 * @param {any} [obj] 
 */
export function isref(obj) {
  if (!obj) return false;
  return "$ref" in obj;
}

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
 * @param {any} obj 
 * @param {any} [root] 
 * @returns {T=}
 */
export function deref_if_needed(obj, root) {
  return isref(obj) ? deref(obj.$ref, root) : obj;
}
