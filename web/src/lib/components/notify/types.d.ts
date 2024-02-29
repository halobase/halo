export type ToastType = "info" | "warn" | "error";

export type Toast = {
  id?: number,
  type?: ToastType,
  timeout?: number,
  dismissable?: boolean,
  message: string,
};