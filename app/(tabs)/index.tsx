import moSalah from '@/assets/images/licensed-image.jpeg';
import { View, Text, StyleSheet, ImageBackground, Pressable } from 'react-native';
import {Link} from 'expo-router'

export default function Index() {

  
  return (
    <View style={styles.container}>
      <ImageBackground
      source={moSalah}
      resizeMode='cover'
      style={{ width: '100%', height: 800 }}>
      <Text style={styles.text}>index.js</Text>
      <Link href="/explore" asChild>
      <Pressable style={styles.button}><Text style={styles.text}>Explore</Text></Pressable></Link>
      </ImageBackground>
    </View>
  )
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
  },
  text:{
    color: 'white',
    fontSize: 42,
    textAlign: 'center',
    marginTop: 50,
    backgroundColor: 'rgba(200, 200, 220, 1)',
    padding: 4
  },
  button: {
    margin: 'auto',
    width: 200,
    borderRadius: 30,
    padding: 6,
    bottom: 200
  }
})