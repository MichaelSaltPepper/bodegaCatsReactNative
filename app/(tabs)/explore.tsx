import React, {useEffect, useState, useRef} from 'react';
import MapView, {Marker} from 'react-native-maps';
import { StyleSheet, View, Alert, Button, Animated, Pressable, Text, SafeAreaView} from 'react-native';
import {db} from ',,/../components/db/db'
import { MaterialIcons } from '@expo/vector-icons';


type Pin =  {created_at: string, id: number, lat: number, lng: number}
type Cat = {id: number, name: string, description: string, pin_id: number}
// I need to create a Flatlist that will render the fetched cat data
// I'm only fetching pins originally

// create a 


export default function App() {
  const [expanded, setExpanded] = useState(true);
  const animation = useRef(new Animated.Value(0)).current;
  const [markers, setMarkers] = useState<Pin[]>([]);
  const [newMarker, setNewMarker] = useState<Pin | null>(null);
  const [addingCat, setAddingCat] = useState(false)

  useEffect(() => {
    Animated.timing(animation, {
      toValue: expanded ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [expanded, animation]);

  const height = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 200], // collapsed height -> expanded height
  });

  async function getProfile() {
    try {
      // setLoading(true)
      // if (!session?.user) throw new Error('No user on the session!')
      const { data, error, status } = await db
  .from('Pin')
  .select('*');
  console.log('data', data)
      if (error && status !== 406) {
        throw error
      }
      if (data) {
        console.log('success')
        const formattedMarkers: Pin[] = data.map((row: Pin) => ({
            lat: row.lat,
            lng: row.lng,
            id: row.id,
            created_at: row.created_at,
          }));
        setMarkers(formattedMarkers);
        console.log('markers')
      }
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(error.message)
      }
    } finally {
      // setLoading(false)
    }
  }
  useEffect(() => {
  getProfile();
  }, [])
  return (
    <View style={styles.container}>
      <MapView style={styles.map} 
    initialRegion={{
    latitude: 40.7,
    longitude: -73.93,
    latitudeDelta: 0.3,
    longitudeDelta: 0.3,
  }}
  >
    {newMarker && (
          <Marker
            coordinate={{latitude: newMarker.lat, longitude: newMarker.lng}}
            pinColor="blue" // differentiate new marker
            title="New Cat"
            draggable
            onDragEnd={(e) => {
          const { latitude, longitude } = e.nativeEvent.coordinate;
          setNewMarker({ lat: latitude, lng: longitude, id: -1, created_at: "" }); // only one “pending” marker
        }}
          />
        )}
     {markers.map((marker, index) => {
      console.log('marker', marker, index)
     return <Marker
      key={marker.id}
      coordinate={{latitude: marker.lat, longitude: marker.lng}}
      // title={marker.title}
      // description={marker.description}
    />
})}
    </MapView>
  <View style={[styles.buttonContainer, addingCat ? styles.buttonBad : styles.buttonGood]}>
        <Button
          title={!addingCat ? 'Add Cat' : 'Cancel'}
          color={addingCat ? 'white' : 'blue'}
          onPress={() => {
            if(addingCat){
              setNewMarker(null)
            } else{
              setNewMarker({ lat: 40.8, lng: -73.93, id: -1, created_at: "" }); // only one “pending” marker
            }
            setAddingCat(!addingCat);
          }}
        />
        </View>
       {addingCat && <View style={[styles.buttonContainer2, styles.buttonConfirm]}>
        <Button
          title="Confirm"
          color="white"
          onPress={() => {
            // bring up box for adding a new cat
          }}
        />
      </View>}

       <View style={styles.containerBottom}>
      <Pressable onPress={() => setExpanded(!expanded)}>
        <View style={{position: 'relative', zIndex: 100, backgroundColor: 'white',  width: 30,      // make it fit the icon
    height: 30,  justifyContent: 'center',alignItems: 'center', }}>
      <MaterialIcons name={expanded ? 'keyboard-arrow-up' : 'keyboard-arrow-down'} size={30} />
      </View>
      </Pressable>
      <Animated.View style={[styles.box, { height }]}>
        <Text>Content goes here</Text>
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
    width: '100%',
    height: '100%',
    zIndex: 0,
  },
buttonContainer: {
    position: 'absolute', // overlay
    bottom: 600,           // distance from bottom
    right: 20,            // distance from right
    borderRadius: 8,
    padding: 5,
    zIndex: 999,
  },
  buttonContainer2: {
    position: 'absolute', // overlay
    bottom: 670,           // distance from bottom
    right: 20,            // distance from right
    borderRadius: 8,
    padding: 5,
      zIndex: 10,
  },
  buttonGood: {
    backgroundColor: 'rgba(255,255,255,0.9)', // optional: semi-transparent background

  },
  buttonBad: {
    backgroundColor: 'rgba(230, 16, 16, 0.9)', // optional: semi-transparent background
  },
 buttonConfirm: {
    backgroundColor: 'rgba(0, 255, 0, 0.9)', // optional: semi-transparent background
  },
  containerBottom: { position: 'absolute', bottom: 100, left: 20, right: 20, zIndex: 20},
  header: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  box: { backgroundColor: 'lightblue', padding: 10 },});