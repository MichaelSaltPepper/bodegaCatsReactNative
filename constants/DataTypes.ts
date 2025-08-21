export type Pin = { created_at: string; id: number; lat: number; lng: number };
export type Cat = {
  id: number;
  name: string;
  description: string;
  pin_id: number;
  file_name: string;
  user_id: string;
};
export type User = { user_id: string; user_name: string; is_admin: boolean };
export type Submission = {
  id: number;
  lat: number;
  lng: number;
  name: string;
  description: string;
  file_names: string;
  status: string;
  user_id: string;
};
export const UNNAMED_CAT = "Anonymous Kitty Car 🐱🐈🚗";
