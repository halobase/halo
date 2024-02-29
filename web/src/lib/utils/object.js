/**
 * @template T, K
 * @param {T[]} a
 * @param {(o: T) => K} f
 * @returns {Record<K, T[]>}
 */
export function groupby(a, f) {
  return a.reduce((ac, o) => {
    const k = f(o);
    (ac[k] = ac[k] || []).push(o);
    return ac;
  }, Object.create(null));
}


/**
 * Returns a string to a key if the key exists in the 
 * FormData-like object otherwise an empty string gets 
 * returned. This is useful when getting any primitive 
 * typed values from a FormData-like object.
 * 
 * @example
 * const a_string = get(form, "key");
 * const a_number = +get(form, "key");
 * const a_boolean = !!get(form, "key");
 * 
 * @param {import("./types").FormDataLike} form
  * @param {string} key
  * @returns {string}
  */
 export function get(form, key) {
   return form.get(key)?.toString() || "";
 }