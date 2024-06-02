import { z } from "zod";

export const $openapi = z.object(
  {
    openapi: z.string({ description: "OpenAPI version." }),
    info: z.object({
      title: z.string({ description: "A human-friendly service name." }),
      version: z.string({ description: "Service version." })
    }),
    tags: z
      .array(
        z.object({
          name: z.string({ description: "Tag name." })
        }),
        { description: "An array of tags used to classify the service." }
      )
      .optional()
  },
  {
    description:
      "An OpenAPI v3.0.3 schema object. Below are some required fields."
  }
);

export const $error = z
  .object({
    message: z.string(),
    cause: z.unknown().optional()
  })
  .openapi("Error");

const $id = z.string({ description: "Unique ID." });

export const $base = z
  .object({
    id: $id,
    created_at: z
      .string({ description: "Datetime created." })
      .datetime()
      .optional(),
    updated_at: z
      .string({ description: "Datetime updated." })
      .datetime()
      .optional(),
    user: z.string({ description: "User ID." }).optional()
  })
  .openapi("Base");

export const $base_unauthed = $base.omit({
  user: true
});

export const $user = $base_unauthed
  .extend({
    name: z.string({ description: "User name." }),
    level: z.number({ description: "User level." })
  })
  .openapi("User");
