import React from 'react';
import { ScrollView, AppRegistry,StyleSheet,Intro,Results, Image, FlatList, Text, View,Button } from 'react-native';

export default class MenuScreen extends React.Component {
  static navigationOptions = {
    title: 'Menu',
  };

  render() {
    return (
      <ScrollView style={styles.food_grid}>
        {/* Go ahead and delete ExpoLinksView and replace it with your
           * content, we just wanted to provide you with some helpful links */}
        <FlatList
          data={[
            { key: "Salad", price: 9, currency: "CRC", tags: ["fast-food", "new","bla","bla","bal"], imageUrl: require("../assets/images/salad.jpg")},
            { key: "Beef", price: 28, currency: "CRC", tags: ["fast-food", "new"], imageUrl: require("../assets/images/beef.jpg") },
            { key: "Fish", price: 22, currency: "CRC", tags: ["fast-food", "new"], imageUrl: require("../assets/images/fish.jpg") },
            { key: "Pasta", price: 1600, currency: "CRC", tags: ["fast-food", "new"], imageUrl: require("../assets/images/pasta.jpg") },
            { key: "Pizza", price: 8, currency: "CRC", tags: ["fast-food", "new"], imageUrl: require("../assets/images/pizza.jpg") },
            { key: "Hamburger", price: 12, currency: "CRC", tags: ["fast-food", "new"], imageUrl: require("../assets/images/hamburger.jpg") },
            { key: "Salad", price: 30, currency: "CRC", tags: ["fast-food", "new"], imageUrl: require("../assets/images/salad.jpg")},
            { key: "Beef", price: 20, currency: "CRC", tags: ["fast-food", "new"], imageUrl: require("../assets/images/beef.jpg") },
            { key: "Fish", price: 12, currency: "CRC", tags: ["fast-food", "new"], imageUrl: require("../assets/images/fish.jpg") },
            { key: "Pasta", price: 12, currency: "CRC", tags: ["fast-food", "new"], imageUrl: require("../assets/images/pasta.jpg") },
            { key: "Pizza", price: 12, currency: "CRC", tags: ["fast-food", "new"], imageUrl: require("../assets/images/pizza.jpg") },
            { key: "Hamburger", price: 12, currency: "CRC", tags: ["fast-food", "new"], imageUrl: require("../assets/images/hamburger.jpg") },
          ]}
          renderItem={
            ({ item }) =>
              <View style={styles.food_item}>
                <Image
                  style={{ width:100, height:100, resizeMode: 'cover', borderRadius:5,flex:2 }}
                  source={item.imageUrl} 
                />
                <View style={styles.food_item_info}>
                  <Text 
                    style={{fontWeight: 'bold',fontSize:20, color:'#3d3d3d',marginBottom:5}}>
                    {item.key} 
                  </Text>
                  <View style={{flex:1,flexDirection:'row',flexWrap:'wrap'}}>
                    {
                      item.tags.map(i => {
                        return <Text style={{borderWidth:1,borderRadius:5,borderColor:"#aaa",color:"#aaa",padding:2,marginRight:3,height:25}}>{i}</Text>
                      })
                    }
                  </View>
                  <View style={{ padding: 3, marginRight: 2 }}><Text style={{ fontWeight: 'bold', backgroundColor:'#28a745',color:"#fff",width:80,borderRadius:5,padding:5,textAlign:"center"}}>{"$" + item.price + " " + item.currency}</Text></View>
                </View>
                <View style={{flexDirection: 'column',width:50,justifyContent:"space-between"}}>
                  <Button style={{ color: '#fff',borderRadius:5,textAlign:"center",flex:1,width:"100%",height:10,textAlignVertical:"center" }} title="+"/>
                  <Button color="#dc3545" style={{ color: '#fff', backgroundColor:"#dc3545",borderRadius:5,textAlign:"center",flex:1,width:"100%",height:10,textAlignVertical:"center" }} title="-"/>
                </View>
              </View>
          }
        />
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  food_grid: {
    flex: 1,
    backgroundColor: '#fff',
    flexDirection: 'column'
  },
  food_item: {
    flex: 1,
    flexDirection:"row",
    padding:10,
    width:"100%",
    backgroundColor: '#fff',
    borderColor: '#eee',
    borderBottomWidth: 1,
    justifyContent:"space-between",
    alignContent:'flex-start'
  },
  food_item_info:{
    flex: 5,
    marginLeft:8,
    marginRight:8,
    alignSelf:'flex-start'
  }
});
