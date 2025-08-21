import { useUpload } from "@/components/context/UploadContext";
import type { Submission } from "@/components/DataTypes";
import { SubmissionItem } from "@/components/SubmissionPage/SubmissionsItem";
import { TopSelector } from "@/components/SubmissionPage/TopSelector";
import { SubmissionStatus } from "@/components/Utils/FrontEndContanstsAndUtils";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { FlatList, Text, View } from "react-native";
import { db, fetchSubmissionsForUser } from "../../components/db/db";
// for CatViewer and this page
// I want to be able to make the other update itself
// update CatViewer on Accept/Reject
// update this when a new cat is submitted

const Third = () => {
  const queryClient = useQueryClient();

  // context to upate submissions
  const { uploadCompleted, setUploadCompleted } = useUpload();

  const [selectedOption, setSelectedOption] = useState<string>(
    SubmissionStatus.Pending
  );

  const {
    data: submissionsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["submissions"],
    queryFn: fetchSubmissionsForUser, // must return { submissions, isAdmin }
  });

  const submissions = submissionsData?.submissions ?? [];
  const isAdmin = submissionsData?.isAdmin ?? false;

  // ckear admin flag and submissions on log out
  useEffect(() => {
    const { data: listener } = db.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        queryClient.removeQueries({ queryKey: ["submissions"] });
      }
    });

    return () => listener.subscription.unsubscribe();
  }, [queryClient]);

  useEffect(() => {
    if (uploadCompleted) {
      refetch();
      setUploadCompleted(false);
    }
  }, [uploadCompleted, refetch, setUploadCompleted]);

  console.log(submissions);
  console.log("imageURLLLSSS");

  if (isLoading) return <Text>Loading...</Text>;
  if (error) return <Text>Error loading submissions</Text>;

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
            key={item.id}
            submission={item}
            index={index}
            submissions={submissions}
            isAdmin={isAdmin}
            refetch={refetch}
          />
        )}
      />
    </View>
  );
};

export default Third;
