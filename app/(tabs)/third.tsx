import type { Submission } from "constants/DataTypes";
import { UNNAMED_CAT } from "constants/DataTypes";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Text,
  View,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import { db } from "../../components/db/db";

// display all submissions for the current user

// TODO allow displaying of multiple images for cats in explore
// TODO functions needed for admin
// TODO add a small map view for preview
// update submission status
// TODO for acceptance: create pin, and cat entries
// TODO allow map to update immediately
//3. update this when the user makes a new submission, logs in, or logs out
//4. make it extensible by adding admin functionalisties

const bucket = "dev";
const Third = () => {
  // I want this to be a dictionary of file names (in the submission) to
  // the link to access in the bucket
  // TODO make submissions show up right after submitting
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({});
  const [signedIn, setSignedIn] = useState(false);
  const [submissions, setSubmissions] = useState<Submission[]>([]);

  // retrive cats when signedIn changes
  async function retrieveSubmissions() {
    try {
      // setLoading(true)
      // if (!session?.user) throw new Error('No user on the session!')
      const { data: sessionData } = await db.auth.getSession();
      let userId = "";
      if (sessionData?.session) {
        userId = sessionData.session.user.id;
        console.log("Supabase user ID:", userId);
      } else {
        return;
      }
      const { data, error, status } = await db
        .from("Submission")
        .select("*")
        .eq("user_id", userId);
      console.log("data", data);
      if (error && status !== 406) {
        throw error;
      }
      if (data) {
        console.log("success");
        const mySubmissions: Submission[] = data.map((row: Submission) => ({
          id: row.id,
          lat: row.lat,
          lng: row.lng,
          name: row.name,
          description: row.description,
          file_names: row.file_names,
          status: row.status,
          user_id: row.user_id,
        }));
        console.log("submissions", mySubmissions);
        setSubmissions(mySubmissions);
      }
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(error.message);
      }
    }
  }

  function getStatusEmoji(status: string): string {
    let emoji = "";

    switch (status) {
      case "accepted":
        emoji = "✅";
        break;
      case "rejected":
        emoji = "❌";
        break;
      case "pending":
        emoji = "➖";
        break;
      default:
        emoji = "❓"; // optional for unknown status
    }

    return emoji;
  }

  const SubmissionItem = ({
    submission,
    index,
  }: {
    submission: Submission;
    index: number;
  }) => (
    <View
      style={{
        marginBottom: index === submissions.length - 1 ? 120 : 20,
        alignItems: "center",
      }}
    >
      <Text>
        Status: {submission.status} {getStatusEmoji(submission.status)}
      </Text>
      <Text>
        Name: {submission.name.length > 0 ? submission.name : UNNAMED_CAT}
      </Text>
      <Text style={{ marginBottom: 15 }}>
        Description:{" "}
        {submission.description.length > 0
          ? submission.description
          : "No description"}
      </Text>
      <MapView
        style={{ width: 300, height: 300, marginBottom: 30 }}
        initialRegion={{
          latitude: submission.lat,
          longitude: submission.lng,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        }}
      >
        <Marker
          coordinate={{ latitude: submission.lat, longitude: submission.lng }}
        />
      </MapView>
      <View>
        {submission.file_names.split(",").map((file_name, i) => {
          return imageUrls[file_name] ? (
            <View>
              <Text style={{ fontSize: 18, fontWeight: "bold", bottom: 5 }}>
                {i + 1}.
              </Text>
              <Image
                key={file_name}
                source={{ uri: imageUrls[file_name] }}
                style={{
                  width: 300,
                  height: 300,
                  resizeMode: "cover",
                  marginBottom: 30,
                }}
              />
            </View>
          ) : (
            <ActivityIndicator key={file_name} />
          );
        })}
      </View>
    </View>
  );

  // fetch links for images when cats change
  useEffect(() => {
    submissions.forEach((submission) => {
      submission.file_names.split(",").forEach((file_name) => {
        if (!imageUrls[file_name]) {
          fetchSignedImageUrl(file_name);
        }
      });
    });
  }, [submissions, imageUrls]);

  // set signed in status
  useEffect(() => {
    async function initAuth() {
      // Get the current Supabase session
      const session = await db.auth.getSession();

      if (session.data.session) {
        setSignedIn(true);

        // Check if provider is Google
      } else {
        setSignedIn(false);
      }
    }

    initAuth();

    // Listen for auth state changes (SIGN_IN / SIGN_OUT)
    const { data: listener } = db.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN") {
        setSignedIn(true);
      } else if (event === "SIGNED_OUT") {
        setSignedIn(false);
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!signedIn) {
      setSubmissions([]);
    } else {
      // initialize the cats
      retrieveSubmissions();
    }
  }, [signedIn]);

  const fetchSignedImageUrl = async (file_path: string) => {
    try {
      const { data } = db.storage.from(bucket).getPublicUrl(file_path);

      console.log("signedUrl", data.publicUrl);
      console.log("file path", file_path);
      setImageUrls((prev) => ({ ...prev, [file_path]: data.publicUrl }));
    } catch (err) {
      console.error("Error fetching image URL:", err);
    }
  };
  return (
    <View
      style={{
        backgroundColor: "white",
        height: "100%",
        flex: 1,
        padding: 15,
      }}
    >
      <FlatList
        keyExtractor={(submission: Submission) => submission.id.toString()}
        data={submissions}
        renderItem={({ item, index }) => (
          <SubmissionItem submission={item} index={index} />
        )}
      />
    </View>
  );
};

export default Third;
