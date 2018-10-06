import React from 'react';
import colors from '../constants/Colors.js';
import {
  ScrollView,
  AppRegistry,
  StyleSheet,
  Intro,
  Results,
  Image,
  FlatList,
  Text,
  View,
  Button,
} from 'react-native';
var order = {}//Datos de la orden a realizarse
export default class MenuScreen extends React.Component {
  static navigationOptions = {
    title: 'Menu',
  };
  number = 0;
  render() {
    return (
      <View style={{ backgroundColor: "#fff", height: "100%" }}>
        <View style={{ backgroundColor: "#5EBA7D", flexDirection: "row", justifyContent: "center", alignContent: "center", alignItems: "center", height: 55 }}>
          <View style={{ height: "100%", flex: 1, alignContent: "center", justifyContent: "center", }}>
            <Text style={{ color: "#fff", fontSize: 20, fontWeight: "bold", textAlign: "center" }}>0</Text>
            <Text style={{ color: "#fff", fontSize: 9, fontWeight: "bold", textAlign: "center" }}>Quantity</Text>
          </View>
          <View style={{ height: "100%", flex: 1, alignContent: "center", justifyContent: "center", }}>
            <Text style={{ color: "#fff", fontSize: 20, fontWeight: "bold", textAlign: "center" }}>0 min</Text>
            <Text style={{ color: "#fff", fontSize: 9, fontWeight: "bold", textAlign: "center" }}>Delivery Time</Text>
          </View>
          <View style={{ height: "100%", flex: 1, alignContent: "center", justifyContent: "center", }}>
            <Text style={{ color: "#fff", fontSize: 20, fontWeight: "bold", textAlign: "center" }}>0</Text>
            <Text style={{ color: "#fff", fontSize: 9, fontWeight: "bold", textAlign: "center" }}>Total Price</Text>
          </View>
        </View>
        <ScrollView style={styles.food_grid}>
          <FlatList
            data={[
              {
                key: 'Salad',
                price: 1680,
                currency: '₡',
                tags: ['a', 'b', 'c', 'd', 'e'],
                imageUrl: 'https://www.skinnytaste.com/wp-content/uploads/2018/04/Chopped-Salad-with-Shrimp-Blue-Cheese-and-Bacon-1.jpg',
              },
              {
                key: 'Beef',
                price: 2658,
                currency: '₡',
                tags: ['f', 'g'],
                imageUrl: 'https://hips.hearstapps.com/del.h-cdn.co/assets/17/38/2048x1365/gallery-1506010658-beef-tenderloin-delish.jpg?resize=480:*',
              },
              {
                key: 'Fish',
                price: 3500,
                currency: '₡',
                tags: ['h', 'i'],
                imageUrl: 'https://www.ndtv.com/cooks/images/KERELA.FISH.66%281%29.jpg?downsize=650:400&output-quality=70&output-format=webp',
              },
              {
                key: 'Pasta',
                price: 1600,
                currency: '₡',
                tags: ['j', 'k'],
                imageUrl: 'http://superpola.com//site/assets/files/24157/468.jpg',
              },
              {
                key: 'Pizza',
                price: 8000,
                currency: '₡',
                tags: ['l', 'm'],
                imageUrl: 'https://www.infobae.com/new-resizer/-AU5yITpCjSXYx8cRXI43OAvP1c=/600x0/filters:quality(100)/s3.amazonaws.com/arc-wordpress-client-uploads/infobae-wp/wp-content/uploads/2018/09/08130747/semana-de-la-pizza-1920-5.jpg',
              },
            ]}
            renderItem={({ item }) => (
              <View style={styles.food_item}>
                <Image
                  style={styles.food_image}
                  source={{ uri: item.imageUrl }}
                />
                <View style={styles.food_item_info}>
                  <View>
                    <Text
                      style={styles.food_title}>
                      {item.key}
                    </Text>
                  </View>
                  <View style={{flexDirection: 'row', flexWrap: 'wrap' }}>
                    {item.tags.map(i => {
                      return (
                        <Text
                          key={i}
                          style={styles.food_tag}>
                          {i}
                        </Text>
                      );
                    })}
                  </View>
                  <View style={{ marginRight: 2, marginTop: 10 }}>
                    <Text
                      style={styles.food_price}>
                      { item.currency + ' ' + item.price }
                    </Text>
                  </View>
                </View>
                <View
                  style={{
                    flexDirection: 'column',
                    width: 40,
                    justifyContent: 'space-between',
                  }}
                >
                  <View
                    onPress={() => { this.number++ }}
                  >
                    <Text style={{ borderRadius: 3, textAlign: "center", color: "#fff", fontWeight: "bold", backgroundColor: "#5EBA7D", padding: 5, }}>
                      +
                  </Text>
                  </View>
                  <View>
                    <Text style={{ borderRadius: 3, textAlign: "center", color: "#999", fontWeight: "bold", backgroundColor: "#e5e5e5", padding: 5, }}>
                      {this.number}
                    </Text>
                  </View>
                  <View
                    onPress={() => { this.number-- }}
                  >
                    <Text style={{ borderRadius: 3, textAlign: "center", color: "#fff", fontWeight: "bold", backgroundColor: "#dc3545", padding: 5, }}>
                      -
                  </Text>
                  </View>
                </View>
              </View>
            )}
          />
        </ScrollView>
        <View /*style={{backgroundColor:"rgba(0,0,0,0)", position:"absolute", bottom:0, width:"100%" }}*/>
          <Text style={styles.button_place_order}>Place Order</Text>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  food_grid: {
    flex: 1,
    backgroundColor: '#fff',
    flexDirection: 'column',
    height: "100%",
  },
  food_item: {
    flex: 1,
    flexDirection: 'row',
    padding: 10,
    width: '100%',
    backgroundColor: '#fff',
    borderColor: '#eee',
    borderBottomWidth: 1,
    justifyContent: 'space-between',
    alignContent: 'flex-start',
  },
  food_item_info: {
    flex: 5,
    marginLeft: 8,
    marginRight: 8,
    alignSelf: 'flex-start',
  },
  food_title: {
    fontWeight: 'bold',
    fontSize: 20,
    color: '#555',
    marginBottom: 5,
  },
  food_tag: {
    borderWidth: 1,
    borderRadius: 4,
    backgroundColor: "#fff",
    borderColor: '#bbb',
    color: '#aaa',
    padding: 2,
    minWidth: 30,
    textAlign: "center",
    marginRight: 3,
    height: 25,
  },
  food_price: {
    fontWeight: 'bold',
    color: '#666',
    paddingRight: 5,
    paddingTop: 5,
    paddingBottom: 5,
    //backgroundColor: colors.tintColor,
    //textAlign: "center",
    padding: 5,
    //borderRadius: 5,
  },
  food_image: {
    width: 100,
    height: 100,
    resizeMode: 'cover',
    borderRadius: 5,
    flex: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
  },
  button_place_order: {
    borderRadius: 20,
    backgroundColor: "#5EBA7D",
    color: "#fff",
    fontWeight: "bold",
    fontSize: 20,
    textAlign: "center",
    marginRight: 15,
    marginLeft: 15,
    marginTop: 5,
    marginBottom: 5,
    padding: 10,
  }
});
