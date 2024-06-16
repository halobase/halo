import env from "./env";

type Options = {
  auth: Auth;
  ns: string;
  db: string;
};

type Auth =
  | string
  | {
      sc?: string;
      user: string;
      pass: string;
    };

type Response<T> =
  | {
      status: "OK";
      result: T;
      detail?: string;
    }
  | {
      status: "ERR";
      result: string;
      detail?: string;
    };

type Event<T> = {
  id: string;
  action: string;
  result: T;
};

export class SurrealHTTP {
  constructor(
    private url: string,
    private opts: Options
  ) {
    if (!url) {
      throw new Error("surreal: URL is undefined");
    }
  }

  async create<T>(thing: string, init: Partial<T>, auth?: Auth) {
    return await this.curd("POST", thing, auth, init);
  }

  async select<T>(thing: string, auth?: Auth) {
    return await this.curd<T>("GET", thing, auth);
  }

  async delete<T>(thing: string, auth?: Auth) {
    return await this.curd<T>("DELETE", thing, auth);
  }

  async update<T>(thing: string, patch: Partial<T>, auth?: Auth) {
    return await this.curd<T>("PATCH", thing, auth, patch);
  }

  async curd<T>(method: string, thing: string, auth?: Auth, data?: Partial<T>) {
    const [table, id] = thing.split(":");
    const [{ status, result, detail }] = await this.do<Array<T>>(
      method,
      id ? `/key/${table}/${id}` : `/key/${table}`,
      data ?? "",
      undefined,
      auth
    );
    if (status === "ERR") {
      throw new Error(
        detail ?? (typeof result === "string" ? result : "Unexpected error")
      );
    }
    if (typeof result === "string") {
      throw new TypeError("Bad result");
    }
    return result;
  }

  async query<T>(sql: string, vars?: Record<string, unknown>, auth?: Auth) {
    const res = await this.query_raw<T>(sql, vars, auth);
    return res.map(({ status, result, detail }) => {
      if (status === "ERR") {
        throw detail ?? result;
      }
      return result;
    });
  }

  async query_raw<T>(sql: string, vars?: Record<string, unknown>, auth?: Auth) {
    const __vars = Object.fromEntries(
      Object.entries(vars ?? {}).map(([k, v]) => [
        k,
        typeof v === "string" ? v : JSON.stringify(v)
      ])
    );
    return await this.do<T>(
      "POST",
      "/sql",
      sql,
      new URLSearchParams(__vars),
      auth
    );
  }

  private async do<T>(
    method: string,
    path: string,
    body?: string | object,
    params?: URLSearchParams,
    auth?: Auth
  ): Promise<Array<Response<T>>> {
    auth = auth ?? this.opts.auth;
    const headers = {
      NS: this.opts.ns,
      DB: this.opts.db,
      Accept: "application/json",
      Authorization:
        typeof auth === "string"
          ? SurrealHTTP.bearer_token(auth)
          : SurrealHTTP.basic_auth(auth),
      "Content-Type":
        typeof body === "string" ? "text/plain" : "application/json"
    };
    const url = `${this.url}${path}?${params ?? ""}`;
    
    // console.log(url);
    
    const res = await fetch(url, {
      method,
      headers,
      body: typeof body === "string" ? body : JSON.stringify(body)
    });
    if (!res.ok) {
      throw new Error(await res.text());
    }
    return await res.json();
  }

  private static bearer_token(auth: string) {
    return auth.startsWith("Bearer") ? auth : `Bearer ${auth}`;
  }

  private static basic_auth(auth: Auth) {
    if (typeof auth === "string") {
      throw new Error("Bad auth");
    }
    return `Basic ${btoa(auth.user + ":" + auth.pass)}`;
  }
}

export const surreal = new SurrealHTTP(env.SURREAL_URL!, {
  ns: env.SURREAL_NS!,
  db: env.SURREAL_DB!,
  auth: {
    user: env.SURREAL_USER!,
    pass: env.SURREAL_PASS!
  }
});
