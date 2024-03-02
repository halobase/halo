export async function load(event) {
  const { service } = await event.parent();
  const schema = await group_schema(service.schema);
  return {
    schema,
  }
}

const allow_methods = ["get", "post", "delete", "put", "patch"];

/** 
 * @param {import("$lib/types").Schema} schema
 * @returns {Promise<import("$lib/types").SchemaGrouped>} 
 */
async function group_schema(schema) {
  /** @type {Record<string, Array<import("$lib/types").Operation>>} */
  const groups = {};
  /** @type {Record<string, import("$lib/types").Operation>} */
  const operations = {};

  Object.entries(schema?.paths ?? {}).forEach(function ([path, path_object]) {
    const key = path_object.summary ?? path;
    groups[key] = [];
    Object.entries(path_object).forEach(function ([method, operation]) {
      if (allow_methods.includes(method)) {
        if (operation.operationId) {
          operation = { ...operation, method, path }
          groups[key].push(operation);
          operations[operation.operationId] = operation;
        }
      }
    });
  });
  return {
    ...schema,
    groups,
    operations,
  };
}