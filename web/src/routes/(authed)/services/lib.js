
/** @param {Array<import("$lib/types").Service>} services */
export function get_tags(services) {
  /** @type {Set<string>} */
  const S = new Set();
  for (const { schema } of services) {
    for (const { name } of schema.tags ?? []) {
      S.add(name);
    }
  }
  return Array.from(S);
}

/** @param {Array<string>} tags */
export function group_tags(tags) {
  /** @type {Record<string, Array<string>>} */
  const G = {};
  for (const tag of tags) {
    const [type, subtype] = tag.split("/");
    if (!(type in G)) {
      G[type] = [];
    }
    G[type].push(subtype);
  }
  return G;
}

/**
 * @param {Array<string>} A
 * @param {Array<{name: string}>} B
 */
export function filter_union(A, B) {
  for (const a of A) {
    for (const { name } of B) {
      if (name === a) {
        return true;
      }
    }
  }
  return false;
}

/**
 * @param {Array<string>} A
 * @param {Array<{name: string}>} B
 */
export function filter_intersect(A, B) {
  for (const a of A) {
    let found = false;
    for (const { name } of B) {
      if (name === a) {
        found = true;
        break;
      }
    }
    if (!found) return false;
  }
  return true;
}