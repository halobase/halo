/**
 * @param {(...args: any[]) => void} f
 * @param {number} ms
 */
export function debounce(f, ms) {
  /** @type {number | NodeJS.Timeout} */
  let timer;
  return (/** @type {any[]} */ ...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      f(...args);
    }, ms);
  };
}

/** @param {any} a  */
export function S(a) {
  return JSON.stringify(a);
}

/** @param {string} s  */
export function P(s) {
  return JSON.parse(s);
}
