import type { Submission } from "@/constants/DataTypes";
import { SubmissionStatus } from "@/constants/FrontEndContansts";
import { UNNAMED_CAT } from "constants/DataTypes";

import DoubleSwitch from "@/components/DoubleSwitch";
import { ActivityIndicator, Image, Text, View } from "react-native";
import MapView, { Marker } from "react-native-maps";
import {
  deletePinAndCat,
  insertCat,
  insertPin,
  updateSubmission,
} from "./db/db";

const makeNewSubmissionProps = (
  index: number,
  newValue: SubmissionStatus,
  prevSubmissions: Submission[]
) => {
  const newSubmissions = [...prevSubmissions];
  newSubmissions[index].status = newValue;
  return newSubmissions;
};

export const SubmissionItem = ({
  submission,
  index,
  submissions,
  isAdmin,
  setSubmissions,
  imageUrls,
}: {
  submission: Submission;
  index: number;
  submissions: Submission[];
  isAdmin: boolean;
  setSubmissions: React.Dispatch<React.SetStateAction<Submission[]>>;
  imageUrls: Record<string, string>;
}) => {
  async function submissionAction(submission: Submission) {
    updateSubmission(submission);
    if (submission.status === SubmissionStatus.Accepted) {
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
              setSubmissions((prevSubmissions: Submission[]) => {
                const newSubValues = makeNewSubmissionProps(
                  index,
                  SubmissionStatus.Rejected,
                  prevSubmissions
                );
                // update status to rejected
                submissionAction(newSubValues[index]);
                return newSubValues;
              });
            }}
            title={"Reject"}
          />
          <DoubleSwitch
            onBothEnabled={() => {
              setSubmissions((prevSubmissions) => {
                const newSubValues = makeNewSubmissionProps(
                  index,
                  SubmissionStatus.Accepted,
                  prevSubmissions
                );
                // update status to accepted
                // create entriy in Pin, get the new pin_id
                // create new entry in Cat
                submissionAction(newSubValues[index]);
                return newSubValues;
              });
            }}
            title={"Accept"}
          />
        </View>
      )}
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
            <View key={file_name}>
              <Text style={{ fontSize: 18, fontWeight: "bold", bottom: 5 }}>
                {i + 1}/{submission.file_names.split(",").length}
              </Text>
              <Image
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
