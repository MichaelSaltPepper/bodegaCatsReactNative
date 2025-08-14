import {View, Text, FlatList, StyleSheet, SafeAreaView, ScrollView} from 'react-native'
import {ITEMS} from 'constants/Items.js'
const third = () => {
  return (
    <SafeAreaView style={styles.container}>
      {/* <ScrollView> */}
      <View style={{ height: 280 }}>
      <FlatList 
        keyExtractor={(item) => item.id.toString()}
      data={ITEMS} renderItem={({item}) =>  <Text style={styles.text}>{item.name}</Text>}/>
      {/* <Text style={styles.text}>Salty Man</Text>
      <Text style={styles.text}>Salty Man</Text><Text style={styles.text}>Salty Man</Text><Text style={styles.text}>Salty Man</Text><Text style={styles.text}>Salty Man</Text><Text style={styles.text}>Salty Man</Text><Text style={styles.text}>Salty Man</Text><Text style={styles.text}>Salty Man</Text><Text style={styles.text}>Salty Man</Text><Text style={styles.text}>Salty Man</Text><Text style={styles.text}>Salty Man</Text><Text style={styles.text}>Salty Man</Text><Text style={styles.text}>Salty Man</Text><Text style={styles.text}>Salty Man</Text><Text style={styles.text}>Salty Man</Text><Text style={styles.text}>Salty Man</Text><Text style={styles.text}>Salty Man</Text><Text style={styles.text}>Salty Man</Text><Text style={styles.text}>Salty Man</Text><Text style={styles.text}>Salty Man</Text><Text style={styles.text}>Salty Man</Text><Text style={styles.text}>Salty Man</Text><Text style={styles.text}>Salty Man</Text><Text style={styles.text}>Salty Man</Text><Text style={styles.text}>Salty Man</Text> */}
    {/* </ScrollView> */}
    </View>
    </SafeAreaView>
  )
}

export default third

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
  }
})