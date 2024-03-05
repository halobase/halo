export async function load(event) {
  const { service, api_url } = await event.parent();
  const schema = await group_schema(api_url, service);
  return {
    schema,
  }
}

const allow_methods = ["get", "post", "delete", "put", "patch"];

/** 
 * @param {string} api_url 
 * @param {import("$lib/types").Service} service
 * @returns {Promise<import("$lib/types").SchemaGrouped>} 
 */
async function group_schema(api_url, { id, schema }) {
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
          operation = {
            ...operation,
            method,
            path,
            servers: [
              { url: `${api_url}/services/${id}/fetch${path}` }
            ]
          }
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