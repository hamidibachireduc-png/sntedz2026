import { getApps, initializeApp } from 'firebase/app';
import { getAuth, inMemoryPersistence, setPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { firebaseConfig } from './firebaseConfig';

const privateMessagesApp =
  getApps().find((existingApp) => existingApp.name === 'private-messages') ||
  initializeApp(firebaseConfig, 'private-messages');

export const privateMessagesAuth = getAuth(privateMessagesApp);
export const privateMessagesDb = getFirestore(privateMessagesApp);

let authReady: Promise<void> | null = null;

export const preparePrivateMessagesAuth = () => {
  authReady ??= setPersistence(privateMessagesAuth, inMemoryPersistence);
  return authReady;
};
