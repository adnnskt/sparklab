import { Platform } from 'react-native';
import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getAnalytics, isSupported, type Analytics } from 'firebase/analytics';
import { getFirestore, type Firestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyDA7BuMjBSfGGARCq27qn7096L0zGY7cYc',
  authDomain: 'sparklab-2956a.firebaseapp.com',
  projectId: 'sparklab-2956a',
  storageBucket: 'sparklab-2956a.firebasestorage.app',
  messagingSenderId: '388530749080',
  appId: '1:388530749080:web:06933566086deed9009aed',
  measurementId: 'G-CJ8BVKDFBJ',
};

export const app: FirebaseApp = initializeApp(firebaseConfig);

// Banco de dados NoSQL (Cloud Firestore)
export const db: Firestore = getFirestore(app);

// Analytics só existe na web; em iOS/Android retorna null sem quebrar.
let analyticsInstance: Analytics | null = null;

export function getFirebaseAnalytics(): Analytics | null {
  return analyticsInstance;
}

if (Platform.OS === 'web') {
  isSupported()
    .then((supported) => {
      if (supported && !analyticsInstance) {
        analyticsInstance = getAnalytics(app);
      }
    })
    .catch(() => {
      // ambiente sem suporte a Analytics (ex.: navegador em modo privado)
    });
}
