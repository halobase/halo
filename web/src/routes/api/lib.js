const allow_methods = ["get", "post", "delete", "put", "patch"];

/** 
 * @param {import("$lib/types").OpenAPI} schema
 * @returns {Promise<import("$lib/types").SchemaGrouped>} 
 */
export async function group(schema) {
  /** @type {Record<string, Array<import("$lib/types").Operation>>} */
  const groups = {};
  /** @type {Record<string, import("$lib/types").Operation>} */
  const endpoints = {};

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
  return {
    ...schema,
    groups,
    operations: endpoints,
  };
}