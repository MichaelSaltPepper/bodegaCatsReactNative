import type { Cat, Pin } from "@/constants/DataTypes";
import { MaterialIcons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import { db } from "./db/db";
import { bucket } from "./Utils/Credentials";

import {
  ActivityIndicator,
  Animated,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { CatUploadForm } from "./CatUploadForm";
type CatViewerProps = {
  addingCat: boolean;
  expanded: boolean;
  confirmLocation: boolean;
  setExpanded: (val: boolean) => void;
  catHasName: boolean;
  cats: Cat[];
  boxShift: boolean;
  signedIn: boolean;
  setCatHasName: (val: boolean) => void;
  name: string;
  uploadImages: string[];
  catHasDescription: boolean;
  newMarker: Pin | null;
  description: string;
  resetUI: () => void;
  setName: (val: string) => void;
  setDescription: (val: string) => void;
  setUploadImages: (val: string[]) => void;
  setCatHasDescription: (val: boolean) => void;
  setAddingCat: (val: boolean) => void;
};

export const CatViewer: React.FC<CatViewerProps> = ({
  addingCat,
  expanded,
  confirmLocation,
  setExpanded,
  catHasName,
  cats,
  boxShift,
  signedIn,
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
  const [imageUrls, setImageUrls] = useState<Record<number, string>>({});

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

  const animation = useRef(new Animated.Value(0)).current;

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

  const fetchSignedImageUrl = async (catId: number, file_path: string) => {
    try {
      const { data } = db.storage.from(bucket).getPublicUrl(file_path);

      console.log("signedUrl", data.publicUrl);
      setImageUrls((prev) => ({ ...prev, [catId]: data.publicUrl }));
    } catch (err) {
      console.error("Error fetching image URL:", err);
    }
  };

  const height = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, boxShift ? 500 : 300], // collapsed height -> expanded height
  });
  return (
    <View style={{ ...styles.containerBottom, bottom: boxShift ? 90 : 100 }}>
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

        <CatUploadForm
          addingCat={addingCat}
          expanded={expanded}
          catHasName={catHasName}
          setCatHasName={setCatHasName}
          name={name}
          uploadImages={uploadImages}
          catHasDescription={catHasDescription}
          newMarker={newMarker}
          description={description}
          resetUI={resetUI}
          setName={setName}
          setDescription={setDescription}
          setUploadImages={setUploadImages}
          setCatHasDescription={setCatHasDescription}
        />

        <FlatList
          style={{ display: addingCat ? "none" : "flex" }}
          keyExtractor={(cat: Cat) => cat.id.toString()}
          data={cats}
          renderItem={({ item }) => <CatItem cat={item} />}
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  containerBottom: { position: "absolute", left: 20, right: 20, zIndex: 20 },
  box: { backgroundColor: "white", padding: 10 },
});
