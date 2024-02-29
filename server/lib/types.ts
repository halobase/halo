type ID = string;

type Base = {
  readonly id: ID,
  icon?: string,
  created_at?: string,
  updated_at?: string,
  user?: string,
};

type BaseUnauthed = Omit<Base, "user">;

export type User = BaseUnauthed & {
  name: string,
  scope: "user" | "admin",
  level: number,
};

export type Grant = GrantPP | GrantOTP;

export type GrantPP = {
  type: "PP",
  user: string,
  pass: string,
};

export type GrantOTP = {
  type: "OTP",
  user: string,
  code: string,
};

export type Auth = {
  user: User,
  token: string,
};

export type Service = Base & {
  public?: boolean,
  readme: string,
  schema: {
    openapi: string,
    info: {
      title: string,
      version: string,
    },
    tags?: {
      name: string,
    }[]
  },
};

export type Node = Base & {
  url: string,
  service: string,
  user: string,
  tags: Array<string>,
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

export type LLM = {
  model: string,
  system_prompt: string,
  temperature: number,
  top_p: number,
};

export type Assistant = Base & {
  name: string,
  description?: string,
  public: boolean,
  knowledge?: string,
  services: Array<string>,
  llm: LLM,
};

export type Chat = Base & {
  assistant: string,
  summary: string,
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