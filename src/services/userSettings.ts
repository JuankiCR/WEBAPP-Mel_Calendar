import { ID, Query, Permission, Role, Models } from "appwrite";
import {
  databases,
  APPWRITE_DATABASE_ID,
  APPWRITE_USER_SETTINGS_COLLECTION_ID,
} from "../lib/appwrite";
import { getCurrentUser } from "./auth";

export type WorkingDay = {
  start?: string;            // Inicio jornada (HH:mm)
  lunchOutFrom?: string;     // Salida comida DESDE (HH:mm)
  lunchOutTo?: string;       // Salida comida HASTA (HH:mm)
  end?: string;              // Fin jornada (HH:mm)
  maxLunchMinutes?: number;  // Duración máxima comida (min)
};

export type UserSettings = Models.Document & {
  userId: string;
  timezone: string;
  workingDay?: string;       // JSON.stringify(WorkingDay)
  themeOverrides?: string;   // JSON.stringify(ThemeOverrides)
  fcmToken?: string;
};

async function getOrCreateSettings(): Promise<UserSettings> {
  const user = await getCurrentUser();
  if (!user) throw new Error("No hay usuario autenticado");

  const res = await databases.listDocuments<UserSettings>(
    APPWRITE_DATABASE_ID,
    APPWRITE_USER_SETTINGS_COLLECTION_ID,
    [Query.equal("userId", user.$id), Query.limit(1)]
  );

  if (res.total > 0) return res.documents[0];

  const permissions = [
    Permission.read(Role.user(user.$id)),
    Permission.update(Role.user(user.$id)),
    Permission.delete(Role.user(user.$id)),
    Permission.write(Role.user(user.$id)),
  ];

  const timezone =
    Intl.DateTimeFormat().resolvedOptions().timeZone || "America/Mexico_City";

  const doc = await databases.createDocument<UserSettings>(
    APPWRITE_DATABASE_ID,
    APPWRITE_USER_SETTINGS_COLLECTION_ID,
    ID.unique(),
    {
      userId: user.$id,
      timezone,
      workingDay: undefined,
      themeOverrides: undefined,
    },
    permissions
  );

  return doc;
}

export async function getUserSettings(): Promise<UserSettings> {
  return getOrCreateSettings();
}

export async function updateUserSettings(
  data: Partial<Pick<UserSettings, "workingDay" | "themeOverrides" | "timezone" | "fcmToken">>
): Promise<UserSettings> {
  const current = await getOrCreateSettings();

  const doc = await databases.updateDocument<UserSettings>(
    APPWRITE_DATABASE_ID,
    APPWRITE_USER_SETTINGS_COLLECTION_ID,
    current.$id,
    data
  );

  return doc;
}
