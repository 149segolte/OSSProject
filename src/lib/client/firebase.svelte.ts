import { initializeApp, type FirebaseOptions, type FirebaseApp } from 'firebase/app';
import { getAnalytics, type Analytics } from 'firebase/analytics';
import { getAuth, type Auth } from 'firebase/auth';

const firebaseConfig: FirebaseOptions = {
	apiKey: 'AIzaSyDDKcW2-fN0qOq6e2uyKH9Hd65S-ASzvHc',
	authDomain: 'ossp-53235.firebaseapp.com',
	databaseURL: 'https://ossp-53235-default-rtdb.asia-southeast1.firebasedatabase.app',
	projectId: 'ossp-53235',
	storageBucket: 'ossp-53235.appspot.com',
	messagingSenderId: '947496534541',
	appId: '1:947496534541:web:41e08f993dba7b30254b44',
	measurementId: 'G-702EZL7W9Q'
};

function initFirebase(config: FirebaseOptions) {
	let app: FirebaseApp;
	let analytics: Analytics;
	let auth: Auth;

	return () => {
		if (!app) {
			app = initializeApp(config);
			analytics = getAnalytics(app);
			auth = getAuth(app);
		}
		return { app, analytics, auth };
	};
}

export const getFirebase = initFirebase(firebaseConfig);
