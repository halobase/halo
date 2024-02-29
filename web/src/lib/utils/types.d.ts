type Nullable<T> = T | null;
type Stringable = {
  toString: () => string,
};

export type FormDataLike = {
  get: (k: string) => Nullable<Stringable>,
};

export type ResponseError = {
  message: string,
};


export type ResponseDeserialized<T, E extends ResponseError = ResponseError> = [
  T,
  undefined,
] | [
  undefined,
  E,
];