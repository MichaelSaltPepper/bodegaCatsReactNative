import { MaterialIcons } from "@expo/vector-icons";
import { useCallback, useEffect, useRef } from "react";
import {
  Animated,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewToken,
} from "react-native";
import MapView from "react-native-maps";
import { Cat, Pin } from "../DataTypes";
import { bucket, supabaseUrl } from "../Utils/Credentials";
import { UNNAMED_CAT } from "../Utils/FrontEndContanstsAndUtils";
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
  ref: React.RefObject<FlatList<any> | null>;
  activeCatId: number;
  setActiveCatId: React.Dispatch<React.SetStateAction<number>>;
  mapRef: React.RefObject<MapView | null>;
  markers: Pin[];
};

function formatTimestamp(timestamp: string) {
  const dateStr = new Date(timestamp).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const timeStr = new Date(timestamp).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${dateStr} at ${timeStr}`;
}

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
  ref,
  activeCatId,
  setActiveCatId,
  mapRef,
  markers,
}) => {
  const CatItem = ({ cat, index }: { cat: Cat; index: number }) => (
    <View style={{ marginBottom: 20, alignItems: "center" }}>
      {/* TODO how to get user and date */}
      <Text
        style={{
          fontWeight: "bold",
          fontSize: 15, // adjust as needed
          marginVertical: 3, // optional spacing
        }}
      >
        Cat ID: {cat.id}
      </Text>
      <Text style={styles.text}>
        Uploaded by: {cat.user_name} on {formatTimestamp(cat.created_at)}
      </Text>
      <Text>Name: {cat.name.length === 0 ? UNNAMED_CAT : cat.name}</Text>
      <Text>
        Description:{" "}
        {cat.description.length === 0 ? "No description" : cat.description}
      </Text>
      {cat.file_name.split(",").map((file_name, i) => {
        return (
          <View key={file_name}>
            <Text style={{ fontSize: 18, fontWeight: "bold", bottom: 5 }}>
              {i + 1}.
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
  );

  const animation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animation, {
      toValue: expanded ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [expanded, animation]);

  const height = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, boxShift ? 500 : 400], // collapsed height -> expanded height
  });

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0) {
        const activeCat = viewableItems[0].item as Cat;
        setActiveCatId(activeCat.id);
        const pin = markers.filter((marker) => marker.id === activeCat.pin_id);
        if (pin.length > 0) {
          mapRef.current?.animateToRegion(
            {
              latitude: pin[0].lat - 0.08,
              longitude: pin[0].lng,
              latitudeDelta: 0.3,
              longitudeDelta: 0.3,
            },
            500
          );
        }
      }
    },
    [markers, mapRef, setActiveCatId] // re-memoize when markers change
  );
  return (
    <View style={{ ...styles.containerBottom, bottom: boxShift ? 90 : 100 }}>
      <Pressable
        style={{ alignSelf: "flex-start", left: 10 }}
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
        <Text
          style={{
            textAlign: "center",
            fontWeight: "bold",
            fontSize: 12, // adjust as needed
            marginVertical: 3, // optional spacing
          }}
        >
          {" "}
          {addingCat ? "New Cat Details" : "All Cats View"}
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
          ref={ref}
          style={{ display: addingCat ? "none" : "flex", width: "100%" }}
          onViewableItemsChanged={onViewableItemsChanged}
          keyExtractor={(cat: Cat) => cat.id.toString()}
          data={cats}
          renderItem={({ item, index }) => <CatItem cat={item} index={index} />}
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  containerBottom: {
    position: "absolute",
    left: 0, // full width
    right: 0,
    zIndex: 20,
    alignItems: "center", // center children horizontally
  },
  box: {
    backgroundColor: "white",
    padding: 10,
    width: "95%", // or "100%" if you want full width minus margins
    alignItems: "center", // center children horizontally
  },
  text: {
    textAlign: "center",
    fontSize: 12, // adjust as needed
    marginVertical: 3, // optional spacing
  },
});
