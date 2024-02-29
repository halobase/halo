// import { read } from "$app/server";
// import { split } from "$lib/utils/markdown";
// import YAML from "yaml";

// /** @type {Record<string, import("$lib/types").Group>} */
// export const groups = {};
// /** @type {Record<string, import("$lib/types").Doc>} */
// export const docs = {};
// /** @type {Record<string, import("$lib/types").API>} */
// export const apis = {};
// /** @type {Record<string, Array<string>>} */
// export const tags = {};

// const meta = import.meta.glob("../../../docs/*/meta.yaml", {
//   as: "url",
//   eager: true,
// });

// const markdown = import.meta.glob("../../../docs/*/*.md", {
//   as: "url",
//   eager: true,
// });

// const APIs = import.meta.glob("../../../docs/*/*.json", {
//   as: 'url',
//   eager: true,
// });

// for (const [file, asset] of Object.entries(meta)) {
//   const [, slug] = /\/\d{2}-(.+)\/meta\.yaml$/.exec(file) ?? [];
//   const group = YAML.parse(await read(asset).text());
//   groups[slug] = { ...group, docs: [] };
// }

// for (const [file, asset] of Object.entries(markdown)) {
//   const [, group_dir, basename] = /\/(\d{2}-.+?)\/(\d{2}-.+\.md)$/.exec(file) ?? [];
//   const group_slug = group_dir.slice(3);
//   const slug = basename.slice(3, -3);
//   const path = [group_slug, slug].join("/");

//   const group = groups[group_slug];
//   if (!group) {
//     continue;
//   }

//   const { head, body } = split(await read(asset).text());
//   /** @type {import("$lib/types").Doc.Head} */
//   const __head = { ...head, slug };
//   const __tail = {};

//   group.docs.push(__head);

//   docs[path] = {
//     head: __head,
//     tail: __tail,
//     body,
//   };

//   for (const tag of __head.tags ?? []) {
//     const [type, subtype] = tag.split("/");
//     if (!(type in tags)) {
//       tags[type] = [];
//     }
//     tags[type].push(subtype);
//   }
// }

// for (const [file, asset] of Object.entries(APIs)) {
//   const [, group_dir, basename] = /\/(\d{2}-.+?)\/(\d{2}-.+\.json)$/.exec(file) ?? [];
//   const group_slug = group_dir.slice(3);
//   const slug = basename.slice(3, -5);
//   const path = [group_slug, slug].join("/");
//   docs[path].tail.api = await read(asset).json();
// }
