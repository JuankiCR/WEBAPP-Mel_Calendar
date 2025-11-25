// src/lib/appwrite.ts
import { Client, Account, Databases, Storage } from 'appwrite';

const client = new Client()
  .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT!)
  .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID!);

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);

export const APPWRITE_DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID!;
export const APPWRITE_NOTAS_COLLECTION_ID = import.meta.env.VITE_APPWRITE_NOTAS_COLLECTION_ID!;
export const APPWRITE_BUCKET_ID = import.meta.env.VITE_APPWRITE_BUCKET_ID!;
