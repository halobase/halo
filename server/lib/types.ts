import { ChatCompletionTool } from "openai/resources/index";

type ID = string;

type Base = {
  readonly id: ID;
  icon?: string;
  created_at?: string;
  updated_at?: string;
  user?: string;
};

type BaseUnauthed = Omit<Base, "user">;

export type User = BaseUnauthed & {
  name: string;
  scope: "user" | "admin";
  level: number;
};

export type Grant = GrantPP | GrantOTP;

export type GrantPP = {
  type: "PP";
  user: string;
  pass: string;
};

export type GrantOTP = {
  type: "OTP";
  user: string;
  code: string;
};

export type Auth = {
  user: User;
  token: string;
};

export type Service = Base & {
  level?: number;
  readme?: string;
  schema?: object;
  tools?: Array<ChatCompletionTool>;
};

export type Node = Base & {
  url: string;
  service: string;
  user: string;
  tags: Array<string>;
};

export type Key = Base & {
  prefix: string;
  name: string;
  scopes: Array<string>;
  accessed_at?: string;
  expires_at?: string;
  secret?: string;
  secret_truncated: string;
  key_onetime?: string;
};

export type K2T = {
  key: Pick<Key, "scopes">;
  token: string;
};

export type LLM = {
  model: string;
  system_prompt: string;
  temperature: number;
  top_p: number;
};

export type Assistant = Base & {
  icon: string;
  name: string;
  description?: string;
  level: number;
  knowledge?: string;
  services: Array<string>;
  llm: LLM;
};

export type Chat = Base & {
  assistant: string;
  summary: string;
};

export type ChatAbstract = {
  text: string;
  file_urls: Array<FileURL>;
};

export type File = Base & {
  type: string;
  name: string;
  object_key: string;
  state: string;
  pre_signed_url: string;
  size: number;
};

export type FileURL = {
  url: string;
  name: string;
  mime_type: string;
  size?: number;
};

type MessageContentText = {
  type: "text";
  text: string;
};

type MessageContentFileURL = {
  type: "file_url";
  file_url: FileURL;
};

export type MessageContent = MessageContentText | MessageContentFileURL;

export type Message = Base & {
  role: "user" | "assistant" | "system";
  content: MessageContent[];
  chat: string;
};
