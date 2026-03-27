import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';

export async function loginUser({ email, password }) {
  console.log('USING FIREBASE LOGIN', email);

  const cred = await signInWithEmailAndPassword(auth, email, password);

  const userRef = doc(db, 'users', cred.user.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    throw new Error('User profile not found in Firestore');
  }

  return {
    authUser: cred.user,
    profile: userSnap.data(),
  };
}

export async function logoutUser() {
  await signOut(auth);
}