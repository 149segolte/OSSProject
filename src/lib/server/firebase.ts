import { FIREBASE_ADMIN } from '$env/static/private';
import { initializeApp, getApps, type App, cert } from 'firebase-admin/app';
import { getDatabase } from 'firebase-admin/database';
import { memoize } from 'lodash';

export const getFirebase = memoize(() => {
	if (getApps().length === 0) {
		let app = initializeApp({
			credential: cert(JSON.parse(FIREBASE_ADMIN)),
			databaseURL: 'https://ossp-53235-default-rtdb.asia-southeast1.firebasedatabase.app'
		});
		return app;
	}
});

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
		let fb = getFirebase();
		let decodedToken = await fb.auth().verifyIdToken(token);
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

interface Player {
	username: string;
	code: string;
}

export async function addPlayer(user: Player): Promise<{ status: boolean; message: string }> {
	let fb = getFirebase() as App;
	let db = getDatabase(fb);
	let gameRef = db.ref(`games/${user.code}`);
	let gameSnapshot = await gameRef.once('value');
	if (!gameSnapshot.exists()) {
		return { status: false, message: 'Game not found' };
	}
	let player = gameSnapshot.child(user.username);
	if (player.exists()) {
		return { status: false, message: 'Player already exists' };
	}
	await gameRef.child(user.username).set(true);
	let id = gameSnapshot.child('players').val();
	await gameRef.child('players').set(id + 1);
	return { status: true, message: `Player ${id} added` };
}
