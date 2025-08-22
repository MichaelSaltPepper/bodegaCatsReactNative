import type { Cat, Pin } from "@/components/DataTypes";
import { CatViewer } from "@/components/ExplorePage/CatViewer";
import { Buttons } from "@/components/ExplorePage/Navigation/Buttons";
import { UserHint } from "@/components/ExplorePage/Navigation/UserHint";
import UserMap from "@/components/ExplorePage/UserMap";
import React, { useEffect, useRef, useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import MapView from "react-native-maps";
import { db, getPins, retrieveCats } from "../../components/db/db";
// type MarkerRef = {
//   showCallout: () => void;
//   hideCallout?: () => void;
// };

export default function App() {
  const mapRef = useRef<MapView | null>(null);
  const [expanded, setExpanded] = useState(true);
  const [newMarker, setNewMarker] = useState<Pin | null>(null);
  const [addingCat, setAddingCat] = useState(false);
  const [cats, setCats] = useState<Cat[]>([]);
  const [markers, setMarkers] = useState<Pin[]>([]);
  const catViewerRef = useRef<FlatList>(null);
  const [activeCatId, setActiveCatId] = useState(-1);

  const [boxShift, setBoxShift] = useState(false);
  const [confirmLocation, setConfirmLocation] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [uploadImages, setUploadImages] = useState<string[]>([]);
  const [catHasName, setCatHasName] = useState(false);
  const [catHasDescription, setCatHasDescription] = useState(false);

  const [locationHintModalVisible, setLocationHintModalVisible] =
    useState(false);
  const [signedIn, setSignedIn] = useState(false);
  function resetUI() {
    setNewMarker(null);
    setExpanded(true);
    setBoxShift(false);
    setConfirmLocation(false);
    setName(""); // move this and desctiption
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
    getPins(setMarkers);
    retrieveCats(setCats);
  }, []);

  return (
    <View style={styles.container}>
      {/* clicking on marker should open view on bottom */}
      <UserMap
        markers={markers}
        setNewMarker={setNewMarker}
        newMarker={newMarker}
        ref={catViewerRef}
        cats={cats}
        activeCatId={activeCatId}
        setExpanded={setExpanded}
        mapRef={mapRef}
        addingCat={addingCat}
      />
      <UserHint
        locationHintModalVisible={locationHintModalVisible}
        setLocationHintModalVisible={setLocationHintModalVisible}
      />

      <Buttons
        signedIn={signedIn}
        addingCat={addingCat}
        setExpanded={setExpanded}
        setLocationHintModalVisible={setLocationHintModalVisible}
        setAddingCat={setAddingCat}
        setNewMarker={setNewMarker}
        confirmLocation={confirmLocation}
        setBoxShift={setBoxShift}
        setConfirmLocation={setConfirmLocation}
        resetUI={resetUI}
      />
      <CatViewer
        addingCat={addingCat}
        expanded={expanded}
        confirmLocation={confirmLocation}
        setExpanded={setExpanded}
        catHasName={catHasName}
        cats={cats} // probably an array of cat objects
        boxShift={boxShift}
        signedIn={signedIn}
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
        setAddingCat={setAddingCat}
        ref={catViewerRef}
        activeCatId={activeCatId}
        setActiveCatId={setActiveCatId}
        mapRef={mapRef}
        markers={markers}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  header: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },

  modalContent: {
    width: 250,
    padding: 20,
    backgroundColor: "white",
    borderRadius: 10,
    alignItems: "center",
  },
});
