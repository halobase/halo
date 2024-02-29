import type { File } from "$lib/types";

interface FileInputEventTarget extends EventTarget {
  files?: FileList,
}

export interface FileInputEvent extends Event {
  target: FileInputEventTarget | null,
}

export type PreSignedURL = {
  url: string,
  object_key: string,
};

export type PreSignedUploadParams = {
  url_pre_sign: string,
  url_file: string,
  stop_on_error?: boolean,
  input?: (files: FileList) => Promise<void>,
  progress?: (file: File, index: number) => Promise<void>,
  error?: (err: Error, index: number) => Promise<void>,
};