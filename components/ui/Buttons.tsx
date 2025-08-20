import type { Pin } from "@/constants/DataTypes";
import { Button, StyleSheet, View } from "react-native";
type ButtonsProps = {
  signedIn: boolean;
  addingCat: boolean;
  setExpanded: (val: boolean) => void;
  setLocationHintModalVisible: (val: boolean) => void;
  setAddingCat: (val: boolean) => void;
  setNewMarker: (val: Pin | null) => void;
  confirmLocation: boolean;
  setBoxShift: (val: boolean) => void;
  setConfirmLocation: (val: boolean) => void;
  resetUI: () => void;
};

export function Buttons({
  signedIn,
  addingCat,
  setExpanded,
  setLocationHintModalVisible,
  setAddingCat,
  setNewMarker,
  confirmLocation,
  setBoxShift,
  setConfirmLocation,
  resetUI,
}: ButtonsProps) {
  return (
    <View>
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
    </View>
  );
}

const styles = StyleSheet.create({
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
});
