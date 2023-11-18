import type { Handle } from '@sveltejs/kit';
import { decodeToken } from '$lib/server';

export const handle = (async ({ event, resolve }) => {
	const token = event.cookies.get('google_auth_cookie');
	if (token) {
		const user = await decodeToken(token);
		if (user) {
			event.locals.user = user;
		}
	}

	return resolve(event);
}) satisfies Handle;
