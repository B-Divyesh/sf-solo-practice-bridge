import type { BridgeData, PracticePlan, PracticeSession } from './types';

const DB_NAME = 'solo-practice-bridge';
const DB_VERSION = 1;

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('plans')) db.createObjectStore('plans', { keyPath: 'id' });
      if (!db.objectStoreNames.contains('sessions')) db.createObjectStore('sessions', { keyPath: 'id' });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(new Error('Your browser could not open local practice storage.'));
  });
}

function complete(transaction: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(new Error('Your practice change could not be saved.'));
    transaction.onabort = () => reject(new Error('Your practice change was cancelled.'));
  });
}

function readAll<T>(store: IDBObjectStore): Promise<T[]> {
  return new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result as T[]);
    request.onerror = () => reject(new Error('Your local practice records could not be read.'));
  });
}

export async function loadData(): Promise<{ plans: PracticePlan[]; sessions: PracticeSession[] }> {
  const db = await openDatabase();
  const transaction = db.transaction(['plans', 'sessions'], 'readonly');
  const [plans, sessions] = await Promise.all([
    readAll<PracticePlan>(transaction.objectStore('plans')),
    readAll<PracticeSession>(transaction.objectStore('sessions'))
  ]);
  db.close();
  return { plans, sessions };
}

export async function savePlan(plan: PracticePlan): Promise<void> {
  const db = await openDatabase();
  const transaction = db.transaction('plans', 'readwrite');
  transaction.objectStore('plans').put(plan);
  await complete(transaction);
  db.close();
}

export async function saveSession(session: PracticeSession): Promise<void> {
  const db = await openDatabase();
  const transaction = db.transaction('sessions', 'readwrite');
  transaction.objectStore('sessions').put(session);
  await complete(transaction);
  db.close();
}

export async function replaceData(data: BridgeData): Promise<void> {
  const db = await openDatabase();
  const transaction = db.transaction(['plans', 'sessions'], 'readwrite');
  const plans = transaction.objectStore('plans');
  const sessions = transaction.objectStore('sessions');
  plans.clear();
  sessions.clear();
  data.plans.forEach((plan) => plans.put(plan));
  data.sessions.forEach((session) => sessions.put(session));
  await complete(transaction);
  db.close();
}
