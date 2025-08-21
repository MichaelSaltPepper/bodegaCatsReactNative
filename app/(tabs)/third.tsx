import { useUpload } from "@/components/context/UploadContext";
import { SubmissionItem } from "@/components/SubmissionsItem";
import { TopSelector } from "@/components/TopSelector";
import { SubmissionStatus } from "@/constants/FrontEndContansts";
import type { Submission } from "constants/DataTypes";
import { useEffect, useState } from "react";
import { FlatList, View } from "react-native";
import { db, fetchSubmissionsForUser } from "../../components/db/db";
// for CatViewer and this page
// I want to be able to make the other update itself
// update CatViewer on Accept/Reject
// update this when a new cat is submitted

const bucket = "dev";
const Third = () => {
  const { uploadCompleted, setUploadCompleted } = useUpload();
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({});
  const [signedIn, setSignedIn] = useState(false);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string>(
    SubmissionStatus.Pending
  ); // default selection

  // retrive cats when signedIn changes
  async function retrieveSubmissions() {
    const { submissions, isAdmin } = await fetchSubmissionsForUser();
    setSubmissions(submissions);
    setIsAdmin(isAdmin);
  }

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
    setIsAdmin(false);
  }, [signedIn]);

  useEffect(() => {
    if (uploadCompleted) {
      retrieveSubmissions();
      setUploadCompleted(false);
    }
  }, [uploadCompleted, setUploadCompleted]);

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
      <TopSelector
        options={Object.values(SubmissionStatus)}
        selected={selectedOption}
        setSelected={setSelectedOption}
      />
      <FlatList
        keyExtractor={(submission: Submission) => submission.id.toString()}
        data={submissions.filter((s) => s.status === selectedOption)}
        renderItem={({ item, index }) => (
          <SubmissionItem
            submission={item}
            index={index}
            submissions={submissions}
            isAdmin={isAdmin}
            setSubmissions={setSubmissions}
            imageUrls={imageUrls}
          />
        )}
      />
    </View>
  );
};

export default Third;
