import { bucket, db, supabaseUrl } from ",,/../components/db/db";
import { MaterialIcons } from "@expo/vector-icons";
import type { Cat, Pin } from "constants/DataTypes";
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
  Pressable,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import MapView, { Marker } from "react-native-maps";

const bucketDownloadURL = `${supabaseUrl}/functions/v1/storage-upload`;
const UNNAMED_CAT = "Anonymous Kiity Car 🐱🐈🚗";

// I need to create a Flatlist that will render the fetched cat data
// I'm only fetching pins originally

// create a

// how should cat fetching work?
// start by retrieving all cats

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
  const [isEnabled, setIsEnabled] = useState(false);

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
    outputRange: [0, boxShift ? 400 : 300], // collapsed height -> expanded height
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

    // TODO use anonkey to upload image
  };

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
      <View
        style={[
          styles.buttonContainer,
          addingCat ? styles.buttonBad : styles.buttonGood,
        ]}
      >
        <Button
          title={!addingCat ? "Add Cat" : "Cancel"}
          color={addingCat ? "white" : "blue"}
          onPress={() => {
            if (addingCat) {
              setNewMarker(null);
              setExpanded(true);
              setBoxShift(false);
              setConfirmLocation(false);
              setName("");
              setDescription("");
              setUploadImages([]);
            } else {
              setNewMarker({ lat: 40.8, lng: -73.93, id: -1, created_at: "" }); // only one “pending” marker
              setExpanded(false);
            }
            setAddingCat(!addingCat);
          }}
        />
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

      <View style={{ ...styles.containerBottom, bottom: boxShift ? 150 : 100 }}>
        <Pressable onPress={() => setExpanded(!expanded)}>
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
          <Text>{addingCat ? "New Cat Details" : "All Cats View"}</Text>

          <View style={{ display: addingCat && expanded ? "flex" : "none" }}>
            <View>
              <Switch value={isEnabled} onValueChange={setIsEnabled} />
              <Text style={{ marginLeft: 8 }}>{isEnabled ? "No" : "Yes"}</Text>
              <Text style={styles.label}>Name</Text>
            </View>
            {!isEnabled ? (
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Enter Name"
                returnKeyType="done"
                onSubmitEditing={() => {
                  Keyboard.dismiss();
                }}
              />
            ) : (
              <Text>{UNNAMED_CAT}</Text>
            )}

            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, { height: 65 }]}
              value={description}
              onChangeText={setDescription}
              placeholder="Enter description"
              returnKeyType="done"
              multiline
              blurOnSubmit={true}
              onSubmitEditing={() => {
                Keyboard.dismiss();
              }}
            />

            <Button title="Pick Images" onPress={pickImage} />

            {uploadImages.map((uri, index) => (
              <Image
                key={index}
                source={{ uri }}
                style={{ width: 100, height: 100, marginRight: 10 }}
              />
            ))}

            <Button title="Submit" onPress={submitForm} />
          </View>

          <FlatList
            style={{ display: addingCat ? "none" : "flex" }}
            keyExtractor={(cat: Cat) => cat.id.toString()}
            data={cats}
            renderItem={({ item }) => <CatItem cat={item} />}
          />
        </Animated.View>
      </View>
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
  },
});
