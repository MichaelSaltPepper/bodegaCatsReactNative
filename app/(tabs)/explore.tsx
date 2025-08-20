import { MaterialIcons } from "@expo/vector-icons";
import type { Cat, Pin } from "constants/DataTypes";
import { UNNAMED_CAT } from "constants/DataTypes";
import * as ImagePicker from "expo-image-picker";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Button,
  FlatList,
  Image,
  Keyboard,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import CustomModal from "../../components/CustomModal";
import {
  bucket,
  db,
  supabaseAnonKey,
  supabaseUrl,
} from "../../components/db/db";

const bucketUploadURL = `${supabaseUrl}/functions/v1/upload-images`;
const mimeTypes: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  gif: "image/gif",
  webp: "image/webp",
};
// TODO only allow to add cats if signed in
// TODO display preview of cat submissions

export default function App() {
  const [expanded, setExpanded] = useState(true);
  const animation = useRef(new Animated.Value(0)).current;
  const [markers, setMarkers] = useState<Pin[]>([]);
  const [newMarker, setNewMarker] = useState<Pin | null>(null);
  const [addingCat, setAddingCat] = useState(false);
  const [cats, setCats] = useState<Cat[]>([]);
  const [imageUrls, setImageUrls] = useState<Record<number, string>>({});
  const [boxShift, setBoxShift] = useState(false);
  const [confirmLocation, setConfirmLocation] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [uploadImages, setUploadImages] = useState<string[]>([]);
  const [catHasName, setCatHasName] = useState(false);
  const [catHasDescription, setCatHasDescription] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [previewImageUri, setPreviewImageUri] = useState<string>("");
  const [locationHintModalVisible, setLocationHintModalVisible] =
    useState(false);
  const [signedIn, setSignedIn] = useState(false);

  function resetUI() {
    setNewMarker(null);
    setExpanded(true);
    setBoxShift(false);
    setConfirmLocation(false);
    setName("");
    setDescription("");
    setUploadImages([]);
    setCatHasName(false);
    setCatHasDescription(false);
    setAddingCat(false);
  }

  useEffect(() => {
    // initial check
    async function checkUser() {
      const userRes = await db.auth.getUser();
      setSignedIn(!!userRes.data.user);
    }
    checkUser();

    // listen for auth state changes
    const { data: listener } = db.auth.onAuthStateChange((event, _) => {
      if (event === "SIGNED_IN") setSignedIn(true);
      else if (event === "SIGNED_OUT") setSignedIn(false);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);
  useEffect(() => {
    Animated.timing(animation, {
      toValue: expanded ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [expanded, animation]);

  useEffect(() => {
    cats.forEach((cat) => {
      if (!imageUrls[cat.id]) {
        fetchSignedImageUrl(cat.id, cat.file_name);
      }
    });
  }, [cats, imageUrls]);

  const height = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, boxShift ? 500 : 300], // collapsed height -> expanded height
  });

  async function retrieveCats() {
    try {
      // setLoading(true)
      // if (!session?.user) throw new Error('No user on the session!')
      const { data, error, status } = await db.from("Cat").select("*");
      console.log("data", data);
      if (error && status !== 406) {
        throw error;
      }
      if (data) {
        console.log("success");
        const newCats: Cat[] = data.map((row: Cat) => ({
          description: row.description,
          pin_id: row.pin_id,
          id: row.id,
          name: row.name,
          file_name: row.file_name,
          user_id: row.user_id,
        }));
        console.log("cats", newCats);
        setCats(newCats);
      }
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(error.message);
      }
    }
  }

  const fetchSignedImageUrl = async (catId: number, file_path: string) => {
    try {
      const { data } = db.storage.from(bucket).getPublicUrl(file_path);

      console.log("signedUrl", data.publicUrl);
      setImageUrls((prev) => ({ ...prev, [catId]: data.publicUrl }));
    } catch (err) {
      console.error("Error fetching image URL:", err);
    }
  };

  async function getPins() {
    try {
      // setLoading(true)
      // if (!session?.user) throw new Error('No user on the session!')
      const { data, error, status } = await db.from("Pin").select("*");
      console.log("data", data);
      if (error && status !== 406) {
        throw error;
      }
      if (data) {
        console.log("success");
        const formattedMarkers: Pin[] = data.map((row: Pin) => ({
          lat: row.lat,
          lng: row.lng,
          id: row.id,
          created_at: row.created_at,
        }));
        setMarkers(formattedMarkers);
        console.log("markers");
      }
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(error.message);
      }
    } finally {
      // setLoading(false)
    }
  }
  useEffect(() => {
    getPins();
    retrieveCats();
  }, []);

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

  const submitForm = () => {
    console.log("Name:", name);
    console.log("Description:", description);
    console.log("Images:", uploadImages);

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
    async function foo() {
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
          Alert.alert("Failed upload");
        }
        const result = await response.json();
        console.log("Uploaded file data:", result.data);
        console.log("result", result);
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
    foo();

    resetUI();
  };
  // TODO display user pending submissions in another tab

  const CatItem = ({ cat }: { cat: Cat }) => (
    <View style={{ marginBottom: 20 }}>
      <Text>
        {cat.name} - {cat.description}
      </Text>
      {imageUrls[cat.id] ? (
        <Image
          source={{ uri: imageUrls[cat.id] }}
          style={{ width: 300, height: 300, resizeMode: "contain" }}
        />
      ) : (
        <ActivityIndicator />
      )}
    </View>
  );
  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: 40.7,
          longitude: -73.93,
          latitudeDelta: 0.3,
          longitudeDelta: 0.3,
        }}
      >
        {newMarker && (
          <Marker
            coordinate={{ latitude: newMarker.lat, longitude: newMarker.lng }}
            pinColor="blue" // differentiate new marker
            title="New Cat"
            draggable
            onDragEnd={(e) => {
              const { latitude, longitude } = e.nativeEvent.coordinate;
              setNewMarker({
                lat: latitude,
                lng: longitude,
                id: -1,
                created_at: "",
              }); // only one “pending” marker
            }}
          />
        )}
        {markers.map((marker, index) => {
          console.log("marker", marker, index);
          return (
            <Marker
              key={marker.id}
              coordinate={{ latitude: marker.lat, longitude: marker.lng }}
              // title={marker.title}
              // description={marker.description}
            />
          );
        })}
      </MapView>
      <CustomModal
        visible={locationHintModalVisible}
        onClose={() => setLocationHintModalVisible(false)}
      >
        <View style={{ alignItems: "center", marginBottom: 10 }}>
          <Text style={{ fontWeight: "bold", fontSize: 18, marginBottom: 5 }}>
            Tip from Whiskers!
          </Text>
          <View>
            <Text style={{ fontSize: 18 }}>☝️</Text>
            <Text style={{ fontSize: 18 }}>{" ".repeat(3)}\🐱</Text>
            <Text style={{ fontSize: 18 }}>{" ".repeat(5)} |\</Text>
            <Text style={{ fontSize: 18, marginBottom: 35 }}>
              {" ".repeat(5)}/\
            </Text>
          </View>
          <Text style={{ fontSize: 18 }}>
            Press and hold on the blue marker to drag it
          </Text>
        </View>
      </CustomModal>
      <View
        style={[
          styles.buttonContainer,
          addingCat ? styles.buttonBad : styles.buttonGood,
        ]}
      >
        {signedIn && (
          <Button
            title={!addingCat ? "Add Cat" : "Cancel"}
            color={addingCat ? "white" : "blue"}
            onPress={() => {
              if (addingCat) {
                resetUI();
              } else {
                setNewMarker({
                  lat: 40.8,
                  lng: -73.93,
                  id: -1,
                  created_at: "",
                }); // only one “pending” marker
                setExpanded(false);
                setLocationHintModalVisible(true); // show modal with location hint
              }
              setAddingCat(!addingCat);
            }}
          />
        )}
      </View>
      {addingCat && (
        <View style={[styles.buttonContainer2, styles.buttonConfirm]}>
          {addingCat && !confirmLocation && (
            <Button
              title="Confirm Location"
              color="white"
              onPress={() => {
                setExpanded(true);
                setBoxShift(true);
                setConfirmLocation(true);
                // bring up box for adding a new cat
              }}
            />
          )}
        </View>
      )}

      <ScrollView
        style={{ ...styles.containerBottom, bottom: boxShift ? 90 : 100 }}
      >
        <Pressable
          onPress={() => {
            if (!(addingCat && !confirmLocation)) {
              setExpanded(!expanded);
            }
          }}
        >
          <View
            style={{
              position: "relative",
              zIndex: 100,
              backgroundColor: "white",
              width: 30, // make it fit the icon
              height: 30,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <MaterialIcons
              name={expanded ? "keyboard-arrow-up" : "keyboard-arrow-down"}
              size={30}
            />
          </View>
        </Pressable>
        <Animated.View style={[styles.box, { height }]}>
          <Text>
            {addingCat ? "New Cat Details" : "All Cats View"}
            {signedIn ? "true" : "flase"}
          </Text>

          <View style={{ display: addingCat && expanded ? "flex" : "none" }}>
            <View
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 10,
                marginTop: 10,
              }}
            >
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

          <FlatList
            style={{ display: addingCat ? "none" : "flex" }}
            keyExtractor={(cat: Cat) => cat.id.toString()}
            data={cats}
            renderItem={({ item }) => <CatItem cat={item} />}
          />
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: "100%",
    height: "100%",
    zIndex: 0,
  },
  buttonContainer: {
    position: "absolute", // overlay
    bottom: 600, // distance from bottom
    right: 20, // distance from right
    borderRadius: 8,
    padding: 5,
    zIndex: 999,
  },
  buttonContainer2: {
    position: "absolute", // overlay
    bottom: 670, // distance from bottom
    right: 20, // distance from right
    borderRadius: 8,
    padding: 5,
    zIndex: 10,
  },
  buttonGood: {
    backgroundColor: "rgba(255,255,255,0.9)", // optional: semi-transparent background
  },
  buttonBad: {
    backgroundColor: "rgba(230, 16, 16, 0.9)", // optional: semi-transparent background
  },
  buttonConfirm: {
    backgroundColor: "rgba(0, 255, 0, 0.9)", // optional: semi-transparent background
  },
  containerBottom: { position: "absolute", left: 20, right: 20, zIndex: 20 },
  header: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  box: { backgroundColor: "white", padding: 10 },
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
  modalContent: {
    width: 250,
    padding: 20,
    backgroundColor: "white",
    borderRadius: 10,
    alignItems: "center",
  },
});
