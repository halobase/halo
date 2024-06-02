import { createRoute, z } from "@hono/zod-openapi";

export const $Grant = z
  .object({
    type: z.literal("PP"),
    user: z.string(),
    pass: z.string()
  })
  .or(
    z.object({
      type: z.literal("OTP"),
      user: z.string(),
      code: z.string()
    })
  )
  .openapi("Grant");

export const $Token = z
  .object({
    access_token: z.string(),
    refresh_token: z.string().optional(),
    expiry: z.number()
  })
  .openapi("Token");

export const $token = createRoute({
  method: "post",
  path: "/token",
  summary: "Apply for a bearer token",
  description: "Apply for a bearer token. Can be used as sign-in or sign-up.",
  operationId: "auth-token",
  tags: ["Auth"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: $Grant
        }
      },
      required: true
    }
  },
  responses: {
    200: {
      description: "The token object.",
      content: {
        "application/json": {
          schema: $Token
        }
      }
    }
  }
});
