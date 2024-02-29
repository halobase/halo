/** @returns {string=} */
export function extract_theme() {
  for (const clazz of document.documentElement.classList) {
    if (clazz.startsWith("theme-")) return clazz;
  }
  return undefined;
}

/**
 * @param {string} [current]
 * @param {string} next
 */
export function swap_theme(next, current) {
  const { classList } = document.documentElement;
  if (current) classList.remove(current);
  classList.add(next);
  localStorage.setItem("theme", next);
}
