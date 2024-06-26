import type { OpenAPIObject, OperationObject } from "openapi3-ts/oas30";


type Base = {
  id: string,
  icon?: string,
  user?: string,
  created_at?: string,
  updated_at?: string,
};

type BaseUnauthed = Omit<Base, "user">;

export type User = BaseUnauthed & {
  name?: string,
  email: string,
  level: string,
  balance: number,
};

export type GrantType = "PP" | "OTP" | "AK";

export type Token = {
  access_token: string,
  refresh_token?: string,
  expiry: number,
};

export type Doc = Base & {
  title: string,
  knowledge: string,
};



export type Key = Base & {
  prefix: string,
  name: string,
  scopes: Array<string>,
  accessed_at?: string,
  expires_at?: string,
  secret?: string,
  secret_truncated: string,
  key_onetime?: string,
};

export type OpenAPI = OpenAPIObject;

export type Service = Base & {
  level?: number,
  current?: string,
  readme?: string,
  schema?: OpenAPI,
  openapi: string
};

export type Node = Base & {
  url: string,
  tags: Array<string>,
};

export type Operation = OperationObject & {
  method: string,
  path: string,
}

export type SchemaGrouped = OpenAPI & {
  groups: Record<string, Array<Operation>>,
  operations: Record<string, Operation>,
};


export type LLM = {
  model: string,
  system_prompt: string,
  temperature: number,
  top_p: number,
};

export type Assistant = Base & {
  name: string,
  description: string,
  level: number,
  knowledge: string,
  services: Array<string>,
  llm: LLM,
};

export type Chat = Base & {
  assistant: string,
  summary: string,
};

export type AssistantQueryOptions = {
  retrieval?: boolean,
};

export type File = Base & {
  type: string,
  name: string,
  object_key: string,
  state: string,
  pre_signed_url: string,
  size: number,
};

type MessageContentText = {
  type: "text",
  text: string,
};

type MessageContentFileURL = {
  type: "file_url",
  file_url: {
    url: string,
    name: string,
    mime_type: string,
    size?: number,
  },
};

export type MessageContent = (
  MessageContentText |
  MessageContentFileURL
);

export type Message = Base & {
  role: "user" | "assistant" | "system",
  content: MessageContent[]
};

export type FileURL = {
  url: string;
  name: string;
  mime_type: string;
  size?: number;
};

export type ChatAbstract = {
  text: string;
  file_urls: Array<FileURL>;
};

declare global {
  type FileInputEvent = Event & {
    target: EventTarget & {
      files?: FileList,
    } | null
  };
} 