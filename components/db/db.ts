import type { Cat, Pin } from "@/constants/DataTypes";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import { Alert } from "react-native";
import {
  bucketUploadURL,
  supabaseAnonKey,
  supabaseUrl,
} from "../Utils/Credentials";
import { mimeTypes } from "../Utils/Utils";
export const db = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
// markers is all of the pins

// data access
export async function getPins(setMarkers: (pins: Pin[]) => void) {
  try {
    const { data, error, status } = await db.from("Pin").select("*");
    if (error && status !== 406) {
      throw error;
    }
    if (data) {
      const formattedMarkers: Pin[] = data.map((row: Pin) => ({
        lat: row.lat,
        lng: row.lng,
        id: row.id,
        created_at: row.created_at,
      }));
      setMarkers(formattedMarkers);
    }
  } catch (error) {
    if (error instanceof Error) {
    }
  }
}

export async function retrieveCats(setCats: (cats: Cat[]) => void) {
  try {
    const { data, error, status } = await db.from("Cat").select("*");
    if (error && status !== 406) {
      throw error;
    }
    if (data) {
      const newCats: Cat[] = data.map((row: Cat) => ({
        description: row.description,
        pin_id: row.pin_id,
        id: row.id,
        name: row.name,
        file_name: row.file_name,
        user_id: row.user_id,
      }));
      setCats(newCats);
    }
  } catch (error) {
    if (error instanceof Error) {
    }
  }
}

export async function makeSubmissonDb(
  uploadImages: string[],
  newMarker: Pin | null,
  name: string,
  description: string
) {
  if (newMarker === null) {
    return;
  }
  const newFileNames: string[] = new Array(uploadImages.length);
  for (let index = 0; index < uploadImages.length; index++) {
    const uri = uploadImages[index];
    const formData = new FormData();
    const filename = uri.split("/").pop() || "file";
    const extension = filename.split(".").pop()?.toLowerCase() || "";
    const mimeType = mimeTypes[extension] || "application/octet-stream";

    formData.append("file", {
      uri,
      name: filename,
      type: mimeType,
    } as any);

    const response = await fetch(bucketUploadURL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${supabaseAnonKey}`,
      },
      body: formData,
    });
    if (!response) {
    }
    const result = await response.json();
    newFileNames[index] = result.data.path;
  }
  console.log("ending file names", newFileNames);
  // create entries in submissions for each cat uploaded
  const { data: sessionData } = await db.auth.getSession();
  let user_id = "";
  if (sessionData?.session) {
    user_id = sessionData.session.user.id;
  } else {
    throw Error("Should have an id if logged in");
  }
  const { data, error } = await db
    .from("Submission") // your table name
    .insert([
      {
        lat: newMarker?.lat,
        lng: newMarker?.lng,
        name: name.trim(),
        description: description.trim(),
        file_names: newFileNames.join(","),
        user_id,
      },
    ]);
  console.log("submission", data);
  console.log("error", error);
  if (error) {
    Alert.alert("Error: Unable to create new submissino entry");
  } else {
    Alert.alert("Successfully submitted");
  }
}
