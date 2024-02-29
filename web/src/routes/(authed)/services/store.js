import { writable } from "svelte/store";

/** 
 * @template T
 * @typedef {import("svelte/store").Writable<T>} Writable
 */

/** @type {Writable<import("./types").Query>} */
export const __query = writable({});

