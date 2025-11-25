// src/services/notas.ts
import { ID, Query, Permission, Role, Models } from 'appwrite';
import { databases, APPWRITE_DATABASE_ID, APPWRITE_NOTAS_COLLECTION_ID } from '../lib/appwrite';
import { getCurrentUser } from './auth';

export type TipoNota =
  | 'general'
  | 'inicio-jornada'
  | 'salida-comida'
  | 'regreso-comida'
  | 'fin-jornada';

export type Nota = Models.Document & {
  userId: string;
  fecha: string;
  texto: string;
  tipo?: TipoNota;
  imagenId?: string;
  videoId?: string;
};


export async function getNotasUsuario(): Promise<Nota[]> {
  const user = await getCurrentUser();
  if (!user) throw new Error('No hay usuario autenticado');

  const res = await databases.listDocuments<Nota>(
    APPWRITE_DATABASE_ID,
    APPWRITE_NOTAS_COLLECTION_ID,
    [Query.equal('userId', user.$id), Query.orderDesc('fecha')]
  );

  return res.documents;
}

export async function crearNota(params: {
  fecha: string;
  texto: string;
  tipo?: TipoNota;
  imagenId?: string;
  videoId?: string;
}): Promise<Nota> {
  const user = await getCurrentUser();
  if (!user) throw new Error('No hay usuario autenticado');

  const data = {
    userId: user.$id,
    fecha: params.fecha,
    texto: params.texto,
    tipo: params.tipo ?? 'general',
    imagenId: params.imagenId,
    videoId: params.videoId,
  };

  const permissions = [
    Permission.read(Role.user(user.$id)),
    Permission.update(Role.user(user.$id)),
    Permission.delete(Role.user(user.$id)),
    Permission.write(Role.user(user.$id)),
  ];

  const doc = await databases.createDocument<Nota>(
    APPWRITE_DATABASE_ID,
    APPWRITE_NOTAS_COLLECTION_ID,
    ID.unique(),
    data,
    permissions
  );

  return doc;
}

export async function actualizarNota(
  id: string,
  data: Partial<Pick<Nota, 'texto' | 'tipo' | 'fecha' | 'imagenId' | 'videoId'>>
): Promise<Nota> {
  const user = await getCurrentUser();
  if (!user) throw new Error('No hay usuario autenticado');

  const doc = await databases.updateDocument<Nota>(
    APPWRITE_DATABASE_ID,
    APPWRITE_NOTAS_COLLECTION_ID,
    id,
    data
  );

  return doc;
}

export async function eliminarNota(id: string): Promise<void> {
  await databases.deleteDocument(
    APPWRITE_DATABASE_ID,
    APPWRITE_NOTAS_COLLECTION_ID,
    id
  );
}
