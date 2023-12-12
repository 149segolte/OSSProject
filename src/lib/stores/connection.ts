import { writable } from 'svelte/store';

type Connection = {
	id: string;
	username: string;
	code: string;
};

export const connection = writable<Connection | null>(null);
