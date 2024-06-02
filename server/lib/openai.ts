import OpenAI from "openai";
import { SignJWT } from "jose";
import { DAY } from "./time";
import env from "./env";

type Adapter = {
  adapt: (c: OpenAI) => Promise<OpenAI>;
};

class AdapterAuto implements Adapter {
  async adapt(client: OpenAI) {
    const base_url = client.baseURL;
    if (base_url.includes("bigmodel.cn")) {
      return new AdapterZhipuAI().adapt(client);
    }
    return client;
  }
}

class AdapterZhipuAI implements Adapter {
  async adapt(client: OpenAI) {
    client.apiKey = await AdapterZhipuAI.generate_token(client.apiKey);
    return client;
  }

  private static async generate_token(api_key: string) {
    const [id, secret] = api_key.split(".");
    if (!id || !secret) {
      throw new Error(`[adapter-zhipuai] Bad API Key: ${api_key}`);
    }
    const forever = 36500 * DAY; // alomost 100 years.
    const now = new Date().getTime();
    const claims = {
      api_key: id,
      timestamp: now,
      exp: now + forever
    };
    const signer = new SignJWT(claims);
    const token = await signer
      .setProtectedHeader({
        alg: "HS256",
        sign_type: "SIGN"
      })
      .sign(new TextEncoder().encode(secret));
    return token;
  }
}

const adapter = new AdapterAuto();
export const openai = await adapter.adapt(
  new OpenAI({
    baseURL: env.OPENAI_URL,
    apiKey: env.OPENAI_KEY
  })
);
