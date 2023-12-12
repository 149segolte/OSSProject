import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { superValidateSync, superValidate } from 'sveltekit-superforms/server';
import { joinSchema } from './schema';
import { addPlayer } from '$lib/server/firebase';

export const load: PageServerLoad = () => {
	return {
		form: superValidateSync(joinSchema)
	};
};

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
	},

	join: async (event) => {
		const form = await superValidate(event, joinSchema);
		if (!form.valid) {
			return fail(400, {
				form
			});
		}
		const res = await addPlayer(form.data);
		if (!res.status) {
			return fail(400, {
				form,
				message: res.message
			});
		}
		return {
			form,
			id: res.message.split(' ')[1]
		};
	}
} satisfies Actions;
