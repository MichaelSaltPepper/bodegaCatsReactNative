import { MaterialIcons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import MapView, { Callout, Marker } from "react-native-maps";
import type { Cat, Pin } from "../DataTypes";
// newMarker represents the marker for new cat
// markers is all of the pins
type UserMapProps = {
  markers: Pin[];
  newMarker: Pin | null;
  setNewMarker: (pin: Pin) => void;
  ref: React.RefObject<FlatList<any> | null>;
  cats: Cat[];
  activeCatId: number;
  setExpanded: (val: boolean) => void;
};

// TODO: clicking on a pin should should move the CatViewer to
// to looing at the associated cat
export default function UserMap({
  markers,
  newMarker,
  setNewMarker,
  ref,
  cats,
  activeCatId,
  setExpanded,
}: UserMapProps) {
  const [debouncedActiveCatId, setDebouncedActiveCatId] = useState(activeCatId);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedActiveCatId(activeCatId);
    }, 100); // debounce 100ms, adjust as needed

    return () => clearTimeout(handler);
  }, [activeCatId]);
  console.log(
    "debugMe",
    activeCatId,
    markers.map((marker) =>
      marker.id === cats.filter((cat) => cat.id === activeCatId)[0]?.pin_id
        ? "yellow"
        : "red"
    )
  );
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
          // ref={(ref) => {
          //   if (ref) markerRefs.current[marker.id] = ref;
          // }}
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
            onPress={() => {
              const index = cats.findIndex(
                (cat) => Number(cat.pin_id) === Number(marker.id)
              );
              console.log("opnress", cats, markers, marker, index);
              if (index !== -1) {
                ref.current?.scrollToIndex({ index, animated: true });
                setExpanded(true);
              }
            }}
            key={marker.id}
            coordinate={{ latitude: marker.lat, longitude: marker.lng }}
            calloutAnchor={{ x: 0.5, y: -0.2 }}
            anchor={{ x: 0.5, y: 1 }}
            pinColor={
              marker.id ===
              cats.filter((cat) => cat.id === debouncedActiveCatId)[0]?.pin_id
                ? "yellow"
                : "red"
            }
          >
            <View
              style={{
                width: 60,
                height: 60,
                alignItems: "center",
                justifyContent: "flex-end",
              }}
            >
              {marker.id ===
              cats.filter((cat) => cat.id === debouncedActiveCatId)[0]
                ?.pin_id ? (
                <MaterialIcons name="location-pin" size={60} color="yellow" />
              ) : (
                <MaterialIcons name="location-pin" size={40} color="red" />
              )}
            </View>
            <Callout>
              <View style={{ width: 50, alignItems: "center" }}>
                <Text>
                  {cats.findIndex((cat) => cat.pin_id === marker.id) !== -1
                    ? cats[
                        cats.findIndex((cat) => cat.pin_id === marker.id)
                      ].id?.toString()
                    : "-1"}
                </Text>
              </View>
            </Callout>
          </Marker>
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
