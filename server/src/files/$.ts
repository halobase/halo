import { createRoute } from "@hono/zod-openapi";
import { $base } from "@lib/$";
import { z } from "zod";

export const $FileInit = z
  .object({
    type: z.string({ description: "File MIME type." }),
    name: z.string({ description: "File name." }),
    size: z.number({ description: "File size in bytes." }),
    object_key: z.string({ description: "Object storage key." })
  })
  .openapi("FileInit");

export const $PresignedURLInit = z
  .object({
    name: z.string({ description: "File name." }),
    method: z.enum(["GET", "PUT"], {
      description: "Method allowed when using the pre-signed URL."
    })
  })
  .openapi("PresignedURLInit");

export const $PresignedURL = z
  .object({
    object_key: z.string({ description: "Object storage key." }),
    url: z.string({ description: "Pre-signed URL." })
  })
  .openapi("PresignedURL");

export const $File = $base
  .merge(
    $FileInit.merge(
      z.object({
        state: z.string({ description: "File state." }),
        pre_signed_url: z.string({ description: "Pre-signed URL." })
      })
    )
  )
  .openapi("File");

export const $FilePathParam = z
  .object({
    id: z.string({ description: "File ID." })
  })
  .openapi("FilePathParam");

export const $FileURL = z
  .object({
    url: z.string({ description: "文件地址" }),
    name: z.string({ description: "文件名" }),
    mime_type: z.string({ description: "文件 MIME 类型" }),
    size: z.number({ description: "文件大小" }).optional()
  })
  .openapi("FileURL");

export const $create_presigned_url = createRoute({
  method: "post",
  path: "/pre-signed-url",
  summary: "Create a pre-signed URL",
  description: "Create a pre-signed URL",
  operationId: "file-create-pre-signed-url",
  tags: ["File"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: $PresignedURLInit
        }
      },
      required: true
    }
  },
  responses: {
    200: {
      description: "The PresignedURL object.",
      content: {
        "application/json": {
          schema: $PresignedURL
        }
      }
    }
  }
});

export const $create = createRoute({
  method: "post",
  path: "/",
  summary: "Create a file",
  description: "Create a file",
  operationId: "file-create",
  tags: ["File"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: $FileInit
        }
      },
      required: true
    }
  },
  responses: {
    200: {
      description: "The File object.",
      content: {
        "application/json": {
          schema: $File
        }
      }
    }
  }
});

export const $delete = createRoute({
  method: "delete",
  path: "/{id}",
  summary: "Delete a file",
  description: "Delete a file",
  operationId: "file-delete",
  tags: ["File"],
  request: {
    params: $FilePathParam
  },
  responses: {
    200: {
      description: "Successfully deleted."
    }
  }
});
