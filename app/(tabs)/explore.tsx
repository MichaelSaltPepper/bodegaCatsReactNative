import { CatViewer } from "@/components/CatViewer";
import { Buttons } from "@/components/ui/Buttons";
import { UserHint } from "@/components/ui/UserHint";
import UserMap from "@/components/UserMap/UserMap";
import type { Cat, Pin } from "constants/DataTypes";
import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { db, getPins, retrieveCats } from "../../components/db/db";

export default function App() {
  const [expanded, setExpanded] = useState(true);
  const [newMarker, setNewMarker] = useState<Pin | null>(null);
  const [addingCat, setAddingCat] = useState(false);
  const [cats, setCats] = useState<Cat[]>([]);
  const [markers, setMarkers] = useState<Pin[]>([]);

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
      <UserMap
        markers={markers}
        setNewMarker={setNewMarker}
        newMarker={newMarker}
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
