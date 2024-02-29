import YAML from "yaml";

/** @param {string} s */
export function split(s) {
  const match = /---\r?\n([\s\S]+?)\r?\n---/.exec(s);
  if (!match) return { head: {}, body: s };

  const frontmatter = match[1];
  const body = s.slice(match[0].length);

  /** @type {Record<string, unknown>} */
  const head = YAML.parse(frontmatter);
  return { head, body };
}