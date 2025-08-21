import type { Cat, Pin, Submission } from "@/constants/DataTypes";
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

export async function insertCat(submission: Submission, pin_id: number) {
  const { data: sessionData } = await db.auth.getSession();
  let user_id = "";
  if (sessionData?.session) {
    user_id = sessionData.session.user.id;
  } else {
    throw Error("Should have an id if logged in");
  }
  const { data, error } = await db
    .from("Cat") // your table name
    .insert([
      {
        name: submission.name.length > 0 ? submission.name : "",
        description:
          submission.description.length > 0 ? submission.description : "",
        pin_id,
        file_name: submission.file_names,
        user_id,
      },
    ]);
  if (error) {
    console.log("submission", data);
  } else {
    console.log("error", error);
  }
}

export async function updateSubmission(submission: Submission) {
  const { data, error } = await db
    .from("Submission")
    .update({
      status: submission.status,
    })
    .eq("id", submission.id);
  if (error) {
    console.log("submission", data);
    Alert.alert("Error: Unable to update submission");
  } else {
    console.log("error", error);
    Alert.alert("Successfully updated Submission");
  }
}

export async function insertPin(lat: number, lng: number): Promise<number> {
  const { data, error } = await db
    .from("Pin")
    .insert([
      {
        lat,
        lng,
      },
    ])
    .select("id") // 👈 return only the id column
    .single();
  console.log("pin", data);
  if (error) {
    Alert.alert("Error: Unable to create new pin");
    return -1;
  } else {
    return data.id;
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

export async function deletePinAndCat(
  submission: Submission
): Promise<boolean> {
  // Step 1: Find the Cat (joined by file_name)
  const { data: cats, error: selectError } = await db
    .from("Cat")
    .select("id, pin_id")
    .eq("file_name", submission.file_names) // match on submission.file_names
    .limit(1); // just in case

  if (selectError) {
    console.error("Error selecting cat:", selectError);
    return false;
  }

  if (!cats || cats.length === 0) {
    console.log("No matching cat found.");
    return false;
  }

  const cat = cats[0];

  // Step 2: Delete Cat
  const { error: deleteCatError } = await db
    .from("Cat")
    .delete()
    .eq("id", cat.id);

  if (deleteCatError) {
    console.error("Error deleting cat:", deleteCatError);
    return false;
  }

  // Step 3: Delete Pin
  const { error: deletePinError } = await db
    .from("Pin")
    .delete()
    .eq("id", cat.pin_id);

  if (deletePinError) {
    console.error("Error deleting pin:", deletePinError);
    return false;
  }
  Alert.alert("succesfully delted pin and cat");
  console.log("Deleted cat", cat.id, "and pin", cat.pin_id);
  return true;
}
