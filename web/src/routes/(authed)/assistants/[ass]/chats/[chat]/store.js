import { writable } from "svelte/store";

/** 
 * @template T
 * @typedef {import("svelte/store").Writable<T>} Writable
 */

/** @type {Writable<Array<import("$lib/types").Message>>} */
export const __messages = writable([]);

/** @type {Writable<string>} */
export const __knowledge = writable("");

/** @type {Writable<Array<string>>} */
export const __services = writable([]);

/** @type {Writable<import("$lib/types").LLM>} */
export const __llm = writable();

/** @type {Writable<import("$lib/types").AssistantQueryOptions>} */
export const __options = writable({});

/** @type {Writable<Pick<import("$lib/types").File, "pre_signed_url" | "size" | "name" | "type" | "state">[]>} */
export const __files = writable([]);

/** @type {Writable<import("$lib/types").Chat>} */
export const __chat = writable();