import type {
  QueryObserverResult,
  RefetchOptions,
} from "@tanstack/react-query";
import { Image, Text, View } from "react-native";
import MapView, { Marker } from "react-native-maps";
import type { Submission } from "../DataTypes";
import {
  deletePinAndCat,
  insertCat,
  insertPin,
  updateSubmission,
} from "../db/db";
import { bucket, supabaseUrl } from "../Utils/Credentials";
import {
  SubmissionStatus,
  UNNAMED_CAT,
} from "../Utils/FrontEndContanstsAndUtils";
import DoubleSwitch from "./DoubleSwitch";
type refetchType = (options?: RefetchOptions | undefined) => Promise<
  QueryObserverResult<
    {
      submissions: Submission[];
      isAdmin: boolean;
    },
    Error
  >
>;

export const SubmissionItem = ({
  submission,
  index,
  submissions,
  isAdmin,
  refetch,
}: {
  submission: Submission;
  index: number;
  submissions: Submission[];
  isAdmin: boolean;
  refetch: refetchType;
}) => {
  async function submissionAction(
    newSubmissionStatus: SubmissionStatus,
    submission: Submission
  ) {
    updateSubmission(submission, newSubmissionStatus);
    if (newSubmissionStatus === SubmissionStatus.Accepted) {
      const new_pin_id = await insertPin(submission.lat, submission.lng);
      await insertCat(submission, new_pin_id);
      console.log("ENDING OF CREATION OF NEW CAT AND PIN");
    } else {
      // delete pin and cat if already created
      // select cat_id, pin_id from inner join between cat and submission
      // on submission.file_names = cat.file_name (and I only have access to
      // submission originally )
      //if I have a result then delete that cat and pin
      await deletePinAndCat(submission);
    }
    refetch();
  }
  return (
    <View
      style={{
        marginBottom: index === submissions.length - 1 ? 120 : 20,
        alignItems: "center",
      }}
    >
      {isAdmin && (
        <View style={{ flexDirection: "row" }}>
          <DoubleSwitch
            onBothEnabled={() => {
              submissionAction(SubmissionStatus.Rejected, submission);
            }}
            title={"Reject"}
          />
          <DoubleSwitch
            onBothEnabled={() => {
              //   // create entriy in Pin, get the new pin_id
              //   // create new entry in Cat
              submissionAction(SubmissionStatus.Accepted, submission);
            }}
            title={"Accept"}
          />
        </View>
      )}
      <Text>
        TODODODODODOD submissions update Name:{" "}
        {submission.name.length > 0 ? submission.name : UNNAMED_CAT}
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
          return (
            <View key={file_name}>
              <Text style={{ fontSize: 18, fontWeight: "bold", bottom: 5 }}>
                {i + 1}/{submission.file_names.split(",").length}
              </Text>
              <Image
                source={{
                  uri: `${supabaseUrl}/storage/v1/object/public/${bucket}/${file_name}`,
                }}
                style={{
                  width: 300,
                  height: 300,
                  resizeMode: "cover",
                  marginBottom: 30,
                }}
              />
            </View>
          );
        })}
      </View>
      <View
        style={{
          height: 1, // line thickness
          backgroundColor: "gray", // line color
          width: "100%", // span full width
          marginVertical: 10, // optional spacing above/below
        }}
      />
    </View>
  );
};
