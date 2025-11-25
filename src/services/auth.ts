// src/services/auth.ts
import { ID, Models } from 'appwrite';
import { account } from '../lib/appwrite';

export async function registerUser(nombre: string, email: string, password: string) {
  const user = await account.create(ID.unique(), email, password, nombre);
  await account.createEmailPasswordSession(email, password);
  return user;
}

export async function loginUser(email: string, password: string) {
  const session = await account.createEmailPasswordSession(email, password);
  return session;
}

export async function logoutUser() {
  await account.deleteSessions();
}

export type AppUser = Models.User<Models.Preferences>;

export async function getCurrentUser(): Promise<AppUser | null> {
  try {
    const user = await account.get();
    return user;
  } catch {
    return null;
  }
}