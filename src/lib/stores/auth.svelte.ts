import type { UserInfo } from 'firebase/auth';
import { page } from '$app/stores';

function getUser() {
	let user = $derived<UserInfo | null>(page.data?.user);

	return {
		get user() {
			return user;
		}
	};
}

export const user = getUser();
