import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions = {
	login: async ({ cookies, request }) => {
		const data = await request.formData();
		const token = data.get('token')?.valueOf();

		if (!token || typeof token !== 'string') {
			return fail(400, { message: 'Token is a required field and must be a string' });
		}

		cookies.set('google_auth_cookie', token, {
			httpOnly: true,
			path: '/',
			secure: true
		});

		return { success: true };
	},
	logout: async (event) => {
		event.cookies.delete('google_auth_cookie');
		event.locals.user = null;
	}
} satisfies Actions;
