/**
 * @typedef {import("openapi3-ts/oas30").OperationObject & {method: string, path: string}} Operation
 * @typedef {import("openapi3-ts/oas30").RequestBodyObject} RequestBody
 * @typedef {import("openapi3-ts/oas30").MediaTypeObject} MediaType
 * @typedef {import("openapi3-ts/oas30").SchemaObject} Schema
 * @typedef {import("openapi3-ts/oas30").ReferenceObject} Reference
 * @typedef {import("openapi3-ts/oas30").OpenAPIObject} OpenAPI
 */

import { deref_if_needed } from "./lib";

/**
 * @param {Operation} op 
 * @param {OpenAPI} [root] 
 */
function __url(op, root) {
  let base_url = op.servers?.length ? op.servers[0].url : "";
  console.log(op.servers);
  console.log(root?.servers);
  console.log(base_url);
  base_url ||= (root?.servers?.length ? root.servers[0].url : "");
  console.log(base_url);
  return `${base_url}${op.path}`;
}

/**
 * @param {Schema | Reference} [schema_or_ref]
 * @param {OpenAPI} [root] 
 */
export function generate(schema_or_ref, root) {
  /** @type {string[]} */
  const buf = [];
  __gen(buf, schema_or_ref, root);
  return buf.join("");
}

/**
 * @param {string[]} buf 
 * @param {Schema | Reference} [schema_or_ref]
 * @param {OpenAPI} [root] 
 */
function __gen(buf, schema_or_ref, root) {
  const schema = deref_if_needed(schema_or_ref, root);
  if (!schema) return;
  if (schema.type === "object") {
    buf.push("{");
    for (const [k, v] of Object.entries(schema.properties ?? {})) {
      buf.push(`"${k}": `);
      __gen(buf, v, root);
      buf.push(", ");
    }
    buf.pop();
    buf.push("}");
  } else if (schema.type === "array") {
    buf.push("[");
    __gen(buf, schema.items, root);
    buf.push("]");
  } else if (schema.type === "boolean") {
    buf.push(`${schema.example ?? false}`);
  } else if (schema.type === "number") {
    buf.push(`${schema.example ?? 0}`);
  } else if (schema.type === "integer") {
    buf.push(`${schema.example ?? 0.0}`);
  } else if (schema.type === "string") {
    buf.push(`"${schema.example ?? ""}"`);
  }
}

/**
 * @param {Operation} op 
 * @param {OpenAPI} [root] 
 */
export function examples(op, root) {
  const url = __url(op, root);
  const body = deref_if_needed(op.requestBody, root);
  const method = op.method.toUpperCase();

  return {
    "Shell / cURL": shell_curl(method, url, body, root),
    "JavaScript / Fetch": javascript_fetch(method, url, body, root),
  };
}

/**
 * @param {string} method 
 * @param {string} url 
 * @param {RequestBody} [body] 
 * @param {OpenAPI} [root] 
 */
export function shell_curl(method, url, body, root) {
  const content = body?.content["application/json"];
  let code = `curl --request ${method} \\
  --url ${url}
  --header 'X-API-Key: <Your API Key>'`;
  if (content) {
    code += `
  --header 'Content-Type: application/json'
  --data '${generate(content.schema, root)}'`;
  }
  return code;
}

/**
 * @param {string} method 
 * @param {string} url 
 * @param {RequestBody} [body] 
 * @param {OpenAPI} [root] 
 */
export function javascript_fetch(method, url, body, root) {
  const content = body?.content["application/json"];
  let code = `const options = {
  method: "${method}",
  headers: {
    "X-API-Key": "Your API Key",
    "Content-Type": "application/json"
  },`;
  if (content) {
    code += `
  body: '${generate(content?.schema, root)}'`;
  }
  code += `
};
fetch("${url}", options);`;
  return code;
}