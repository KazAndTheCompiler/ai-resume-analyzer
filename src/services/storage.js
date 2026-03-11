/**
 * IndexedDB Storage Service - Local Resume Storage
 * Free, persistent local storage for resumes and analysis
 */

const DB_NAME = 'resume-analyzer-db';
const DB_VERSION = 1;
const STORE_NAME = 'resumes';

let db = null;

export async function initDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const database = event.target.result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        const store = database.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('companyName', 'companyName', { unique: false });
        store.createIndex('jobTitle', 'jobTitle', { unique: false });
        store.createIndex('createdAt', 'createdAt', { unique: false });
      }
    };
  });
}

export async function saveResume(resume) {
  if (!db) await initDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    
    const resumeData = {
      ...resume,
      id: resume.id || Date.now().toString(),
      createdAt: resume.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const request = store.put(resumeData);
    
    request.onsuccess = () => resolve(resumeData);
    request.onerror = () => reject(request.error);
  });
}

export async function getResume(id) {
  if (!db) await initDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(id);
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function getAllResumes() {
  if (!db) await initDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();
    
    request.onsuccess = () => {
      // Sort by createdAt descending
      const resumes = request.result || [];
      resumes.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      resolve(resumes);
    };
    request.onerror = () => reject(request.error);
  });
}

export async function deleteResume(id) {
  if (!db) await initDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);
    
    request.onsuccess = () => resolve(true);
    request.onerror = () => reject(request.error);
  });
}

export async function updateResume(id, updates) {
  const resume = await getResume(id);
  if (!resume) throw new Error('Resume not found');
  
  return saveResume({ ...resume, ...updates });
}

export async function clearAllResumes() {
  if (!db) await initDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.clear();
    
    request.onsuccess = () => resolve(true);
    request.onerror = () => reject(request.error);
  });
}

// Initialize DB on module load
initDB().catch(console.error);
