type Icon = string;

export type Slug = {
  id: string;
  name: string;
  group: string;
  icon: Icon;
  slugs?: Array<Slug>;
};

export type Code = {
  lang: (string & {}) | "JavaScript" | "Python",
  content: string,
};

export type Highlight = (code: Code) => string;
