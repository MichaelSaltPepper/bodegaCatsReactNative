import type { Pin } from "@/constants/DataTypes";
import { UNNAMED_CAT } from "@/constants/DataTypes";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Button,
  Image,
  Keyboard,
  Modal,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { useUpload } from "./context/UploadContext";
import { makeSubmissonDb } from "./db/db";
type CatUplormProps = {
  addingCat: boolean;
  expanded: boolean;
  catHasName: boolean;
  setCatHasName: (newValue: boolean) => void;
  name: string;
  uploadImages: string[];
  catHasDescription: boolean;
  newMarker: Pin | null;
  description: string;
  resetUI: () => void;
  setName: (newValue: string) => void;
  setDescription: (newValue: string) => void;
  setUploadImages: (newValue: string[]) => void;
  setCatHasDescription: (newValue: boolean) => void;
};

export const CatUploadForm: React.FC<CatUplormProps> = ({
  addingCat,
  expanded,
  catHasName,
  setCatHasName,
  name,
  uploadImages,
  catHasDescription,
  newMarker,
  description,
  resetUI,
  setName,
  setDescription,
  setUploadImages,
  setCatHasDescription,
}) => {
  const { uploadCompleted, setUploadCompleted } = useUpload();
  const [loading, setLoading] = useState(false);
  async function submitForm() {
    // form valudation
    if (uploadImages.length === 0) {
      Alert.alert("Please select at least one image.");
      return;
    }
    if (!catHasName && name.trim().length === 0) {
      Alert.alert("Cannot have an empty name");
      return;
    }
    if (!catHasDescription && description.trim().length === 0) {
      Alert.alert("Cannot have an empty description");
      return;
    }
    setLoading(true);
    await makeSubmissonDb(uploadImages, newMarker, name, description);
    setLoading(false);
    setUploadCompleted(true);
    resetUI();
  }

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images", // Use string instead of MediaTypeOptions
      allowsMultipleSelection: true,
      quality: 1,
    });

    if (!result.canceled) {
      const uris = result.assets.map((asset) => asset.uri).slice(0, 3); // Limit to 3 images
      setUploadImages(uris);
    }
  };

  const [modalVisible, setModalVisible] = useState(false);
  const [previewImageUri, setPreviewImageUri] = useState<string>("");
  return (
    <View style={{ display: addingCat && expanded ? "flex" : "none" }}>
      {!loading ? (
        <View>
          <View
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 10,
              marginTop: 10,
            }}
          >
            <Text>{uploadCompleted ? "upload done" : "upload not done"}</Text>
            <Text style={styles.label}>Name</Text>
            <Switch
              style={{ marginLeft: 15, marginRight: 10 }}
              value={catHasName}
              onValueChange={(new_val) => {
                setCatHasName(new_val);
                setName(""); // reset name if switching to "has name"
              }}
            />
            <Text style={{ marginLeft: 8 }}>{catHasName ? "No" : "Yes"}</Text>
          </View>
          <View style={{ marginBottom: 10 }}>
            {!catHasName ? (
              <TextInput
                style={styles.input}
                value={name}
                // onChangeText={setName}
                onChangeText={(text) => {
                  setName(text.substring(0, 50));
                }}
                placeholder="Enter Name"
                returnKeyType="done"
                onSubmitEditing={() => {
                  Keyboard.dismiss();
                }}
              />
            ) : (
              <Text
                style={{
                  height: styles.input.height,
                  lineHeight: styles.input.height,
                }}
              >
                {UNNAMED_CAT}
              </Text>
            )}
          </View>
          <View
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 10,
              marginTop: 10,
            }}
          >
            <Text style={styles.label}>Description</Text>
            <Switch
              style={{ marginLeft: 15, marginRight: 10 }}
              value={catHasDescription}
              onValueChange={(new_val) => {
                setCatHasDescription(new_val);
                if (new_val) {
                  setDescription(""); // reset description if switching to "has description"
                }
              }}
            />
            <Text style={{ marginLeft: 8 }}>
              {catHasDescription ? "No" : "Yes"}
            </Text>
          </View>

          {!catHasDescription ? (
            <TextInput
              style={[styles.input, { height: 65 }]}
              value={description}
              onChangeText={(text) => setDescription(text.substring(0, 250))}
              placeholder="Enter description"
              returnKeyType="done"
              multiline
              blurOnSubmit={true}
              onSubmitEditing={() => {
                Keyboard.dismiss();
              }}
            />
          ) : (
            <Text>No Description</Text>
          )}

          <Button title="Pick Images" onPress={pickImage} />
          <View
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 10,
              marginTop: 10,
            }}
          >
            {uploadImages.map((uri, index) => (
              <Pressable
                key={index}
                style={{
                  flex: 1,
                  justifyContent: "center",
                  alignItems: "center",
                }}
                onPress={() => {
                  setModalVisible(true);
                  setPreviewImageUri(uri);
                }}
              >
                <Image
                  source={{ uri }}
                  style={{ width: 100, height: 100, marginRight: 10 }}
                />
              </Pressable>
            ))}
          </View>
          <Modal
            visible={modalVisible}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setModalVisible(false)}
          >
            <Pressable
              style={styles.modalBackground}
              onPress={() => setModalVisible(false)}
            >
              <Image
                source={{ uri: previewImageUri }}
                style={{ width: "90%", height: "90%", resizeMode: "contain" }}
              />
            </Pressable>
          </Modal>

          <Button title="Submit" onPress={submitForm} />
        </View>
      ) : (
        <ActivityIndicator />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  label: { marginBottom: 5, fontWeight: "bold" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 2,
    marginBottom: 5,
    borderRadius: 5,
    height: 30,
  },
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
});
