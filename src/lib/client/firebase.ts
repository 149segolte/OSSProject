import { memoize } from 'lodash';
import { type FirebaseOptions, initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { getAuth } from 'firebase/auth';

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

export const initFirebase = memoize(() => {
	const app = initializeApp(firebaseConfig);
	const analytics = getAnalytics(app);
	const auth = getAuth(app);
	return { app, analytics, auth };
});
