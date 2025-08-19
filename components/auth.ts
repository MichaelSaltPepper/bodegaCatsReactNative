// auth.ts
import { db } from "./db/db";

export const signUp = async (email: string, password: string) => {
  const { data, error } = await db.auth.signUp({ email, password });
  return { data, error };
};

export const signIn = async (email: string, password: string) => {
  const { data, error } = await db.auth.signInWithPassword({ email, password });
  return { data, error };
};

export const signOut = async () => {
  const { error } = await db.auth.signOut();
  return { error };
};

export const getUser = async () => {
  const { data } = await db.auth.getUser();
  return data.user;
};

export const authClientId =
  "331869008608-fdajk1vkuu0ttfd0vdq4gutg72ntq1co.apps.googleusercontent.com";
// com.googleusercontent.apps.331869008608-fdajk1vkuu0ttfd0vdq4gutg72ntq1co
