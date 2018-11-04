import React from 'react'
import {
  ScrollView,
  StyleSheet,
  SectionList,
  FlatList,
  Image,
  Text,
  View
} from 'react-native'
import Modal from 'react-native-modal'
import { Ionicons, EvilIcons } from '@expo/vector-icons'
import Ripple from 'react-native-material-ripple'
import { AsyncStorage } from "react-native"

export default class BillScreen extends React.Component {
  static navigationOptions = {
    title: 'Bill'
  }

  state = {
    isModalVisible: null,
    prunedOrder: null,
    orders: [{ restaurantName: "Rostipollos", total: 12345, orderNumber: 87987156, quantity: 5 }, { restaurantName: "Rostipollos", total: 15451, orderNumber: 4564246968, quantity: 10 }, { restaurantName: "Rostipollos", total: 9788, orderNumber: 4567807, quantity: 4 }, { restaurantName: "Rostipollos", total: 12384, orderNumber: 5665564, quantity: 6 },] //traer todas las ordenes hechas
  }
  pruneOrder() {
    const { order } = this.state
    if (!order) return []
    return order
      .map(section => ({
        ...section,
        data: section.data.filter(item => item.amount > 0)
      }))
      .filter(section => section.data.length > 0)
  }
  _retrieveData = async () => {
    try {
      const value = await AsyncStorage.getItem('orders')
      if (value !== null) {
        // We have data!!
        console.log(JSON.parse(value))
        //this.setState({orders: JSON.parse(value)})
      }
     } catch (error) {
       // Error retrieving data
       console.log(error.message)
     }
  }
  renderOrderItem = ({ item: { amount, item }, index, section }) => {
    const {
      foodItem,
      foodImage,
      foodItemInfo,
      foodTitle,
      foodTag,
      activeItem
    } = styles
    return (
      <View style={[foodItem]}>
        <Image
          style={styles.foodOrderImage}
          source={{
            uri: item.imageUri
              ? item.imageUri
              : 'https://www.incimages.com/uploaded_files/image/970x450/getty_855098134_353411.jpg'
          }}
        />
        <View style={foodItemInfo}>
          <View>
            <Text style={foodTitle}>{item.name}</Text>
          </View>
          <View style={{ marginTop: 5 }}>
            <Text style={styles.foodPrice}>
              {item.currency + ' ' + item.price}
            </Text>
          </View>
        </View>

        <View
          style={{
            flexDirection: 'column',
            width: 40,
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          <View>
            <Text style={{ padding: 5, color: '#555' }}>{amount}</Text>
          </View>
        </View>
      </View>
    )
  }
  renderModalContent = () => {
    const {
      modalContent,
      modalHeader,
      foodGrid,
      modalPrices,
      modalPricesContainer,
    } = styles
    const { prunedOrder } = this.state
    const { subtotal, taxes, total } = this.computePrices()
    console.log(this.computePrices())
    return (
      <View style={modalContent}>
        <View style={modalHeader}>
          <Text style={{ fontSize: 20, color: '#666', marginLeft: 5 }}>
            Order summary
          </Text>
        </View>
        <ScrollView style={foodGrid}>
          <SectionList
            sections={prunedOrder} // Use the order instead of the menu for easier access to the amount
            keyExtractor={({ amount, item }, index) =>
              index + item.name.toPascalCase()
            }
            extraData={this.state}
            renderItem={this.renderOrderItem}
            renderSectionHeader={this.renderSectionHeader}
          />
        </ScrollView>
        <View style={modalPricesContainer}>
          <View style={modalPrices}>
            <Text>Subtotal: </Text>
            <Text>CRC {subtotal}</Text>
          </View>
          <View style={modalPrices}>
            <Text>Taxes (13%): </Text>
            <Text>CRC {taxes}</Text>
          </View>
          <View style={modalPrices}>
            <Text>Total: </Text>
            <Text>CRC {total}</Text>
          </View>
        </View>
      </View>
    )
  }
  computePrices() { //Precios del modal, hay que hacer otro compute del total del bill
    const { prunedOrder } = this.state
    if (!prunedOrder || prunedOrder.length === 0) {
      return {
        subtotal: 0,
        taxes: 0,
        total: 0
      }
    }
    const subtotal = prunedOrder
      .map(section => ({
        price: section.data
          .map(i => i.amount * i.item.price)
          .reduce((a, b) => a + b, 0)
      }))
      .map(section => section.price)
      .reduce((a, b) => a + b, 0)
    const taxes = subtotal * 0.13
    return {
      subtotal,
      taxes,
      total: subtotal + taxes
    }
  }

  computeBillPrices(){//Calcula los totales de la factura

  }

  render () {
    const {
      foodGrid,
      modalPrices,
      modalPricesContainer,
    } = styles
    const { orders } = this.state
    //const { subtotal, taxes, total } = this.computeBillPrices()
    // console.log(this.computePrices())
    return (
      <View style={{ backgroundColor: '#fff', height: '100%' }}>
        {/* <View style={modalHeader}>
          <Text style={{ fontSize: 20, color: '#666', marginLeft: 5 }}>
            Order summary
          </Text>
        </View> */}
        <Modal
          isVisible={this.state.isModalVisible === 2}
          transparent={true}
          animationIn={'slideInLeft'}
          animationOut={'slideOutRight'}
          onBackdropPress={() => {
            this.setState({ isModalVisible: null })
          }}
        >
          {this.renderModalContent()}
        </Modal>
        <ScrollView style={foodGrid}>
          <FlatList
            data={this.state.orders}
            renderItem={({ item }) => ( //Usar el item para traer los datos que se muestran
              <View style={{padding:10,marginBottom:5,borderBottomWidth:1,borderColor:"#e5e5e5",width:"100%",flexDirection:"row",alignItems:"center"}}>
                <Image
                  style={{
                    width: 70, 
                    height: 70,
                  }}
                  source={{
                    uri: 'https://static1.squarespace.com/static/524caf98e4b0b5e2e07fd6cc/t/5b89d72c8a922d4be9a23d5d/1535760181457/Order.png'
                  }}
                />
                <View style={{ marginLeft:5,flexDirection:"column",flex:1,justifyContent:"space-between"}}>
                  <Text style={{ color:"#99989F",fontSize:10}}>Order # {item.orderNumber}</Text>
                  <Text style={{ color: "#6d6d6d", fontWeight: "bold", fontSize: 20 }}>{item.restaurantName}</Text>
                  <Text style={{ color: "#6d6d6d", fontWeight: "bold", fontSize: 11 }}>Items {item.quantity}</Text> 
                </View>
                <View style={{ flexDirection: "column" ,flex:1,justifyContent:"space-between",alignItems:"flex-end"}}>
                  <Text style={{ color: "#9196FD", fontWeight: "bold" }} 
                  onPress={() => {
                    this.setState(this.setState({ isModalVisible: 2 }))
                    //Enviar el numero de orden o algo para cargar los items de una orden especifica en el modal
                  }}>Details</Text>
                  <Text style={{color:"#6d6d6d",fontWeight:"bold",fontSize:17}}>CRC {item.total}</Text>
                </View>
              </View>
            )}
          />
        </ScrollView>
        <View style={modalPricesContainer}>
          <View style={modalPrices}>
            <Text>Subtotal: </Text>
            <Text>CRC 0 </Text>
          </View>
          <View style={modalPrices}>
            <Text>Taxes (13%): </Text>
            <Text>CRC 0</Text>
          </View>
          <View style={modalPrices}>
            <Text>Total: </Text>
            <Text>CRC 0</Text>
          </View>
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({

  modalPricesContainer: {
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  modalPrices: {
    flex: 1,
    borderWidth: 1,
    marginRight: 5,
    padding: 5,
    borderRadius: 8,
    borderColor: '#A5A9FC'
  },
  rippleText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 20,
    textAlign: 'center'
  },
  modalPricesContainer: {
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  modalPrices: {
    flex: 1,
    borderWidth: 1,
    marginRight: 5,
    padding: 5,
    borderRadius: 8,
    borderColor: '#A5A9FC'
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 1,
    justifyContent: 'center',
    borderRadius: 10,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    height: '80%'
  },
  foodGrid: {
    flex: 1,
    backgroundColor: '#fff',
    flexDirection: 'column',
    height: '100%'
  },
  buttonPlaceOrder: {
    borderRadius: 20,
    backgroundColor: '#5EBA7D',
    marginRight: 15,
    marginLeft: 15,
    marginTop: 5,
    marginBottom: 5,
    padding: 10
  },
  modalHeader: {
    borderBottomWidth: 1,
    borderColor: '#e5e5e5',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#fff',
    flexDirection: 'row',
    marginBottom: 10,
    borderRadius: 20
  },
  modalHeader: {
    borderBottomWidth: 1,
    borderColor: '#e5e5e5',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#fff',
    flexDirection: 'row',
    marginBottom: 10,
    borderRadius: 20
  },
  foodTitle: {
    fontWeight: 'bold',
    fontSize: 20,
    color: '#555',
    marginBottom: 5
  },
  foodItem: {
    flex: 1,
    flexDirection: 'row',
    padding: 10,
    width: '100%',
    backgroundColor: '#fff',
    borderColor: '#eee',
    borderBottomWidth: 1,
    justifyContent: 'space-between',
    alignContent: 'flex-start'
  },
  activeItem: {
    // transition: '0.3s ease all',
    borderLeftColor: '#FFDC48',
    borderLeftWidth: 6
  },
  foodItemInfo: {
    flex: 5,
    marginLeft: 8,
    marginRight: 8,
    alignSelf: 'flex-start'
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 1,
    justifyContent: 'center',
    borderRadius: 10,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    height: '80%'
  },
})

String.prototype.toPascalCase = function () {
  return this.match(/[a-z]+/gi)
    .map(function (word) {
      return word.charAt(0).toUpperCase() + word.substr(1).toLowerCase()
    })
    .join('')
}
