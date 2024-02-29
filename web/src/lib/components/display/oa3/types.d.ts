import type { ParameterObject, RequestBodyObject, SchemaObject } from "openapi3-ts/oas30";

export type DereffableObject = SchemaObject & RequestBodyObject & ParameterObject;
