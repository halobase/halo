import { writable } from "svelte/store";

/** 
 * @template T
 * @typedef {import("svelte/store").Writable<T>} Writable
 */

/** @type {Writable<import("$lib/types").User> | undefined} */
export const __user = writable();