import { FIREBASE_ADMIN } from '$env/static/private';
import admin from 'firebase-admin';
import type { DecodedIdToken } from 'firebase-admin/auth';

const initializeFirebase = () => {
	if (!admin.apps.length) {
		const serviceAccount = JSON.parse(FIREBASE_ADMIN);
		admin.initializeApp({
			credential: admin.credential.cert(serviceAccount)
		});
	}
};

interface User {
	uid: string;
	email: string;
	displayName: string;
	photoURL: string;
}

export async function decodeToken(token: string): Promise<User | null> {
	if (!token) {
		return null;
	}

	try {
		initializeFirebase();

		let decodedToken = await admin.auth().verifyIdToken(token);
		if (!decodedToken) {
			return null;
		}
		return {
			displayName: decodedToken.name,
			email: decodedToken.email || '',
			photoURL: decodedToken.picture || '',
			uid: decodedToken.uid
		};
	} catch (err) {
		console.error('An error occurred validating token', (err as Error).message);
		return null;
	}
}
