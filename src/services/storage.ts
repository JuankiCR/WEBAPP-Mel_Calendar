// src/services/storage.ts
import { ID, Permission, Role } from 'appwrite';
import { storage, APPWRITE_BUCKET_ID } from '../lib/appwrite';
import { getCurrentUser } from './auth';

export async function uploadFile(file: File): Promise<string> {
  const user = await getCurrentUser();
  if (!user) throw new Error('No hay usuario autenticado');

  const created = await storage.createFile(
    APPWRITE_BUCKET_ID,
    ID.unique(),
    file,
    [
      Permission.read(Role.user(user.$id)),
      Permission.update(Role.user(user.$id)),
      Permission.delete(Role.user(user.$id)),
    ]
  );

  return created.$id;
}
