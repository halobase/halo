import { writable } from "svelte/store";

/** @typedef {import("./types").Toast} Toast */

/** @type {import("svelte/store").Writable<Array<Toast>>} */
export const toasts = writable([]);

/** @param {import("./types").Toast} toast  */
export function notify(toast) {
  const id = Math.floor(Math.random() * 1000);
  /** @type {Toast} */
  const def = {
    id,
    type: "info",
    timeout: 5000,
    dismissable: false,
    message: ""
  };
  toast = {...def, ...toast};
  toasts.update(a => [toast, ...a]);
  if (toast.timeout) {
    setTimeout(() => dismiss(id), toast.timeout);
  }
}

/** @param {number} id  */
export function dismiss(id) {
  toasts.update(a => a.filter(v => v.id !== id));
}
