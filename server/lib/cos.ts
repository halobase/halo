import COS from "cos-nodejs-sdk-v5";
import env from "./env";

export const cos = new COS({
  SecretId: env.COS_SECRET_ID,
  SecretKey: env.COS_SECRET_KEY,
});
