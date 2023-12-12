import { writable } from 'svelte/store';

export const guest = writable<boolean>(false);
