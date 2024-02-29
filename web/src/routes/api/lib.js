import { sleep } from "$lib/utils/time";

const allow_methods = ["get", "post", "delete", "put", "patch"];

/** @returns {Promise<import("$lib/types").SchemaGrouped>} */
export async function fetch_and_group_schema() {
  /** @type {Record<string, Array<import("$lib/types").Operation>>} */
  const groups = {};
  /** @type {Record<string, import("$lib/types").Operation>} */
  const endpoints = {};
  /** @type {import("$lib/types").Schema} */
  const schema = await fetch("/_api/schema").then((res) => res.json());

  Object.entries(schema.paths).forEach(function ([path, path_object]) {
    Object.entries(path_object).forEach(function ([method, operation]) {
      if (allow_methods.includes(method)) {
        for (const tag of operation.tags ?? []) {
          if (!(tag in groups)) {
            groups[tag] = [];
          }
          if (operation.operationId) {
            operation = { ...operation, method, path }
            groups[tag].push(operation);
            endpoints[operation.operationId] = operation;
          }
        }
      }
    });
  });
  await sleep(1000);
  return {
    ...schema,
    groups,
    operations: endpoints,
  };
}