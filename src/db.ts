import type { BridgeData, PracticePlan, PracticeSession } from './types';

const DB_NAME = 'solo-practice-bridge';
const DB_VERSION = 1;
export type StorageNamespace = 'real' | 'demo';

function databaseName(namespace: StorageNamespace): string {
  return namespace === 'demo' ? `demo:${DB_NAME}` : DB_NAME;
}

function openDatabase(namespace: StorageNamespace): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(databaseName(namespace), DB_VERSION);
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

export async function loadData(namespace: StorageNamespace = 'real'): Promise<{ plans: PracticePlan[]; sessions: PracticeSession[] }> {
  const db = await openDatabase(namespace);
  const transaction = db.transaction(['plans', 'sessions'], 'readonly');
  const [plans, sessions] = await Promise.all([
    readAll<PracticePlan>(transaction.objectStore('plans')),
    readAll<PracticeSession>(transaction.objectStore('sessions'))
  ]);
  db.close();
  return { plans, sessions };
}

export async function savePlan(plan: PracticePlan, namespace: StorageNamespace = 'real'): Promise<void> {
  const db = await openDatabase(namespace);
  const transaction = db.transaction('plans', 'readwrite');
  transaction.objectStore('plans').put(plan);
  await complete(transaction);
  db.close();
}

export async function saveSession(session: PracticeSession, namespace: StorageNamespace = 'real'): Promise<void> {
  const db = await openDatabase(namespace);
  const transaction = db.transaction('sessions', 'readwrite');
  transaction.objectStore('sessions').put(session);
  await complete(transaction);
  db.close();
}

export async function replaceData(data: BridgeData, namespace: StorageNamespace = 'real'): Promise<void> {
  const db = await openDatabase(namespace);
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

export async function deleteData(namespace: StorageNamespace): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    const request = indexedDB.deleteDatabase(databaseName(namespace));
    request.onsuccess = () => resolve();
    request.onerror = () => reject(new Error('The demo records could not be cleared.'));
    request.onblocked = () => reject(new Error('Close other demo tabs, then try again.'));
  });
}
