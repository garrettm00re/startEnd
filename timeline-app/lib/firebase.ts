// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase, ref, set, get, onValue, Database } from 'firebase/database';
import { 
    getAuth, 
    GoogleAuthProvider, 
    signInWithPopup, 
    signOut,
    onAuthStateChanged,
    User 
  } from 'firebase/auth';
import { DayData, Tag } from './types';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional


// these should be in .env --> they're secret
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// 3. Initialize Firebase services
const app = initializeApp(firebaseConfig);    // Initialize Firebase app
const db = getDatabase(app);                  // Get database instance
const auth = getAuth(app);                    // Get auth instance
const googleProvider = new GoogleAuthProvider(); // Create Google auth provider

// 4. Authentication functions
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error('Error signing in with Google:', error);
    throw error;
  }
};

export const signOutUser = () => signOut(auth);

// 5. Database operations
export const saveDayData = async (userId: string, data: DayData) => {
  // Create a reference to the specific user's day data
  const dayRef = ref(db, `users/${userId}/days/${data.date}`);
  // Save the data at that reference
  await set(dayRef, data);
};

export const loadDayData = async (userId: string, date: string): Promise<DayData | null> => {
  const dayRef = ref(db, `users/${userId}/days/${date}`);
  const snapshot = await get(dayRef);
  return snapshot.val();
};

export const saveTags = async (userId: string, tags: Tag[]) => {
  const tagsRef = ref(db, `users/${userId}/tags`);
  await set(tagsRef, tags);
};

export const loadTags = async (userId: string): Promise<Tag[]> => {
  const tagsRef = ref(db, `users/${userId}/tags`);
  const snapshot = await get(tagsRef);
  return snapshot.val() || [];
};

// 6. Real-time listeners
export const useRealtimeDay = (
  userId: string | null, 
  date: string, 
  callback: (data: DayData | null) => void
) => {
  if (!userId) return;
  const dayRef = ref(db, `users/${userId}/days/${date}`);
  // onValue sets up a real-time listener that fires whenever the data changes
  onValue(dayRef, (snapshot) => {
    callback(snapshot.val());
  });
};

export const useRealtimeTags = (
  userId: string | null, 
  callback: (tags: Tag[]) => void
) => {
  if (!userId) return;
  const tagsRef = ref(db, `users/${userId}/tags`);
  onValue(tagsRef, (snapshot) => {
    callback(snapshot.val() || []);
  });
};