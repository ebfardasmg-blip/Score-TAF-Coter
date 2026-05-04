/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { getFirestore, collection, addDoc, getDocs, query, where, orderBy, doc, getDoc, updateDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { Military, TAFResult } from '../types';

let db: any;
let auth: any;
let isFirebaseAvailable = false;

async function initFirebase() {
  try {
    // Attempt dynamic import only if it exists in the manifest eventually
    // Use @vite-ignore to prevent build failure if the file is missing
    const CONFIG_FILE = '../firebase-applet-config.json';
    const config = await import(/* @vite-ignore */ CONFIG_FILE).catch(() => null);
    
    if (config && (config.default || config.apiKey)) {
      const app = initializeApp(config.default || config);
      db = getFirestore(app);
      auth = getAuth(app);
      isFirebaseAvailable = true;
      console.log('Firebase ready.');
    } else {
      console.log('Firebase config not found, using Local Mode.');
    }
  } catch (e) {
    console.log('Using Local Mode.');
  }
}

// Start initialization
initFirebase();

// Memory/Local persistence as fallback
const LOCAL_STORAGE_MILITARIES = 'taf_militaries';
const LOCAL_STORAGE_RESULTS = 'taf_results';

function getLocal<T>(key: string): T[] {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
}

function setLocal<T>(key: string, data: T[]) {
  localStorage.setItem(key, JSON.stringify(data));
}

// Seed data if empty
if (!isFirebaseAvailable && getLocal(LOCAL_STORAGE_MILITARIES).length === 0) {
  const seedMilitaries: Military[] = [
    {
      id: 'seed-1',
      name: 'Ricardo Oliveira',
      rank: 'Capitão',
      age: 28,
      sex: 'M',
      om: '1º Batalhão de Infantaria',
      section: 'Ajudância Geral',
      branch: 'Infantaria',
      teachingLine: 'BELICO',
      createdAt: Date.now()
    }
  ];
  setLocal(LOCAL_STORAGE_MILITARIES, seedMilitaries);
  
  const seedResults: TAFResult[] = [
    {
      id: 'seed-res-1',
      militaryId: 'seed-1',
      date: Date.now() - 86400000 * 30, // 30 days ago
      year: new Date().getFullYear(),
      tafType: 'Primeiro TAF',
      callType: 'Primeira chamada',
      results: { run: 2450, pushUps: 24, sitUps: 38, pullUps: 4 },
      scores: { run: 3, pushUps: 3, sitUps: 4, pullUps: 2, total: 12 },
      mentions: { run: 'B', pushUps: 'B', sitUps: 'MB', pullUps: 'R', overall: 'R' }
    }
  ];
  setLocal(LOCAL_STORAGE_RESULTS, seedResults);
}

export const firebaseService = {
  async getMilitaries(): Promise<Military[]> {
    if (isFirebaseAvailable) {
      const snapshot = await getDocs(collection(db, 'militaries'));
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Military));
    }
    return getLocal<Military>(LOCAL_STORAGE_MILITARIES);
  },

  async addMilitary(military: Omit<Military, 'id'>): Promise<string> {
    if (isFirebaseAvailable) {
      const docRef = await addDoc(collection(db, 'militaries'), military);
      return docRef.id;
    }
    const id = Math.random().toString(36).substr(2, 9);
    const militaries = getLocal<Military>(LOCAL_STORAGE_MILITARIES);
    militaries.push({ id, ...military });
    setLocal(LOCAL_STORAGE_MILITARIES, militaries);
    return id;
  },

  async getTAFResults(militaryId?: string): Promise<TAFResult[]> {
    if (isFirebaseAvailable) {
      const q = militaryId 
        ? query(collection(db, 'taf_results'), where('militaryId', '==', militaryId), orderBy('date', 'desc'))
        : query(collection(db, 'taf_results'), orderBy('date', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TAFResult));
    }
    const results = getLocal<TAFResult>(LOCAL_STORAGE_RESULTS);
    if (militaryId) {
      return results.filter(r => r.militaryId === militaryId).sort((a, b) => b.date - a.date);
    }
    return results.sort((a, b) => b.date - a.date);
  },

  async addTAFResult(result: Omit<TAFResult, 'id'>): Promise<string> {
    if (isFirebaseAvailable) {
      const docRef = await addDoc(collection(db, 'taf_results'), result);
      return docRef.id;
    }
    const id = Math.random().toString(36).substr(2, 9);
    const results = getLocal<TAFResult>(LOCAL_STORAGE_RESULTS);
    results.push({ id, ...result });
    setLocal(LOCAL_STORAGE_RESULTS, results);
    return id;
  },

  async getMilitary(id: string): Promise<Military | null> {
    if (isFirebaseAvailable) {
      const docSnap = await getDoc(doc(db, 'militaries', id));
      return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } as Military : null;
    }
    const militaries = getLocal<Military>(LOCAL_STORAGE_MILITARIES);
    return militaries.find(m => m.id === id) || null;
  },

  async deleteMilitary(id: string): Promise<void> {
    if (isFirebaseAvailable) {
      // Delete military
      await deleteDoc(doc(db, 'militaries', id));
      
      // Delete associated TAF results
      const q = query(collection(db, 'taf_results'), where('militaryId', '==', id));
      const snapshot = await getDocs(q);
      const deletePromises = snapshot.docs.map(d => deleteDoc(doc(db, 'taf_results', d.id)));
      await Promise.all(deletePromises);
      return;
    }
    const militaries = getLocal<Military>(LOCAL_STORAGE_MILITARIES);
    const updated = militaries.filter(m => m.id !== id);
    setLocal(LOCAL_STORAGE_MILITARIES, updated);

    const results = getLocal<TAFResult>(LOCAL_STORAGE_RESULTS);
    const updatedResults = results.filter(r => r.militaryId !== id);
    setLocal(LOCAL_STORAGE_RESULTS, updatedResults);
  },

  async updateMilitary(id: string, military: Partial<Military>): Promise<void> {
    if (isFirebaseAvailable) {
      await updateDoc(doc(db, 'militaries', id), military);
      return;
    }
    const militaries = getLocal<Military>(LOCAL_STORAGE_MILITARIES);
    const index = militaries.findIndex(m => m.id === id);
    if (index !== -1) {
      militaries[index] = { ...militaries[index], ...military };
      setLocal(LOCAL_STORAGE_MILITARIES, militaries);
    }
  },

  async updateTAFResult(id: string, result: Partial<TAFResult>): Promise<void> {
    if (isFirebaseAvailable) {
      await updateDoc(doc(db, 'taf_results', id), result);
      return;
    }
    const results = getLocal<TAFResult>(LOCAL_STORAGE_RESULTS);
    const index = results.findIndex(r => r.id === id);
    if (index !== -1) {
      results[index] = { ...results[index], ...result };
      setLocal(LOCAL_STORAGE_RESULTS, results);
    }
  },

  subscribeToTAFResult(id: string, callback: (result: TAFResult | null) => void): () => void {
    if (isFirebaseAvailable) {
      return onSnapshot(doc(db, 'taf_results', id), (snapshot) => {
        if (snapshot.exists()) {
          callback({ id: snapshot.id, ...snapshot.data() } as TAFResult);
        } else {
          callback(null);
        }
      }, (error) => {
        console.error('Error subscribing to TAF result:', error);
      });
    }
    
    const getResult = () => {
      const results = getLocal<TAFResult>(LOCAL_STORAGE_RESULTS);
      return results.find(r => r.id === id) || null;
    };

    callback(getResult());

    const handler = (e: StorageEvent) => {
      if (e.key === LOCAL_STORAGE_RESULTS) {
        callback(getResult());
      }
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  },

  subscribeMilitaries(callback: (militaries: Military[]) => void): () => void {
    if (isFirebaseAvailable) {
      return onSnapshot(collection(db, 'militaries'), (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Military));
        callback(data);
      }, (error) => {
        console.error('Error subscribing to militaries:', error);
      });
    }
    // For local storage, we can't easily subscribe across tabs without storage events
    // but we can at least provide the initial data
    callback(getLocal<Military>(LOCAL_STORAGE_MILITARIES));
    
    const handler = (e: StorageEvent) => {
      if (e.key === LOCAL_STORAGE_MILITARIES) {
        callback(getLocal<Military>(LOCAL_STORAGE_MILITARIES));
      }
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  },

  subscribeTAFResults(callback: (results: TAFResult[]) => void, militaryId?: string): () => void {
    if (isFirebaseAvailable) {
      const q = militaryId 
        ? query(collection(db, 'taf_results'), where('militaryId', '==', militaryId), orderBy('date', 'desc'))
        : query(collection(db, 'taf_results'), orderBy('date', 'desc'));
        
      return onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TAFResult));
        callback(data);
      }, (error) => {
        console.error('Error subscribing to TAF results:', error);
      });
    }
    
    const getFiltered = () => {
      const results = getLocal<TAFResult>(LOCAL_STORAGE_RESULTS);
      if (militaryId) {
        return results.filter(r => r.militaryId === militaryId).sort((a, b) => b.date - a.date);
      }
      return results.sort((a, b) => b.date - a.date);
    };

    callback(getFiltered());

    const handler = (e: StorageEvent) => {
      if (e.key === LOCAL_STORAGE_RESULTS) {
        callback(getFiltered());
      }
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  },

  isFirebaseConfigured(): boolean {
    return isFirebaseAvailable;
  }
};
