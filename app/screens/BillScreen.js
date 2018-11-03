import React from 'react'
import {
  ScrollView,
  StyleSheet,
  SectionList,
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

  _retrieveData = async () => {
    try {
      const value = await AsyncStorage.getItem('orders')
      if (value !== null) {
        // We have data!!
        console.log(JSON.parse(value))
      }
     } catch (error) {
       // Error retrieving data
       console.log(error.message)
     }
  }

  render () {
    const {
      modalContent,
      modalHeader,
      foodGrid,
      buttonPlaceOrder,
      modalPrices,
      modalPricesContainer,
      rippleText
    } = styles
    // const { prunedOrder } = this.state
    // const { subtotal, taxes, total } = this.computePrices()
    // console.log(this.computePrices())
    return (
      <View style={{ backgroundColor: '#fff', height: '100%' }}>
        {/* <View style={modalHeader}>
          <Text style={{ fontSize: 20, color: '#666', marginLeft: 5 }}>
            Order summary
          </Text>
        </View> */}
        <ScrollView style={foodGrid}>
          {/* <SectionList
            sections={prunedOrder} // Use the order instead of the menu for easier access to the amount
            keyExtractor={({ amount, item }, index) =>
              index + item.name.toPascalCase()
            }
            extraData={this.state}
            renderItem={this.renderOrderItem}
            renderSectionHeader={this.renderSectionHeader}
          /> */}
        </ScrollView>
        <View style={modalPricesContainer}>
          <View style={modalPrices}>
            <Text>Subtotal: </Text>
            <Text>CRC 0</Text>
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

        <Ripple
          rippleColor={'#rgba(255,255,255,0.8)'}
          rippleContainerBorderRadius={20}
          style={buttonPlaceOrder}
          onPress={() => this._retrieveData()}
        >
          <Text style={rippleText}>Confirm</Text>
        </Ripple>
      </View>
    )
  }

  // render () {
  //   return (this.renderModalContent)
  // }
}

const styles = StyleSheet.create({
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
  }
})
