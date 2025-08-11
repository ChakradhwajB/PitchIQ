
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';

interface FirebaseConfig {
    apiKey?: string;
    authDomain?: string;
    projectId?: string;
    storageBucket?: string;
    messagingSenderId?: string;
    appId?: string;
}

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

// This function will be called from the client-side AuthProvider
export function initializeFirebase(firebaseConfig: FirebaseConfig, recaptchaSiteKey?: string) {
    if (getApps().length) {
        app = getApp();
    } else {
        if (!firebaseConfig.apiKey) {
            console.error("Firebase API key is missing. Initialization failed.");
            return;
        }
        app = initializeApp(firebaseConfig);
    }

    auth = getAuth(app);
    db = getFirestore(app);

    // Initialize App Check on the client, only once
    if (typeof window !== 'undefined' && !(window as any).appCheckInitialized) {
        if (recaptchaSiteKey) {
            initializeAppCheck(app, {
                provider: new ReCaptchaV3Provider(recaptchaSiteKey),
                isTokenAutoRefreshEnabled: true
            });
            (window as any).appCheckInitialized = true;
        } else {
            console.warn("Firebase App Check: ReCAPTCHA site key is missing. App Check not initialized.");
        }
    }
}

// These functions allow other parts of the app to get the initialized instances
export const getAppInstance = () => app;
export const getAuthInstance = () => auth;
export const getDb = () => db;
