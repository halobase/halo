import { writable } from "svelte/store";

/** @type {import("svelte/store").Writable<import("$lib/types").SchemaGrouped | undefined>} */
export const schema = writable(undefined);
