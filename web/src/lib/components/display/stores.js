import { writable } from "svelte/store";

/** @type {import("svelte/store").Writable<import("./types").Highlight|undefined>} */
export const highlight = writable(undefined);
