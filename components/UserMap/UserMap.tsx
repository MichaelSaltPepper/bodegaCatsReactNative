import type { Pin } from "constants/DataTypes";
import { StyleSheet } from "react-native";
import MapView, { Marker } from "react-native-maps";

// newMarker represents the marker for new cat
// markers is all of the pins
type UserMapProps = {
  markers: Pin[];
  newMarker: Pin | null;
  setNewMarker: (pin: Pin) => void;
};

export default function UserMap({
  markers,
  newMarker,
  setNewMarker,
}: UserMapProps) {
  return (
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
          />
        );
      })}
    </MapView>
  );
}

const styles = StyleSheet.create({
  map: {
    width: "100%",
    height: "100%",
    zIndex: 0,
  },
});
