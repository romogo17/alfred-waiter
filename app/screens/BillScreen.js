import React, { Component } from 'react'
import {
  ScrollView,
  StyleSheet,
  SectionList,
  FlatList,
  Image,
  Text,
  View,
  Platform,
  TouchableOpacity,
  StatusBar,
  Alert
} from 'react-native'
import { format } from 'date-fns'
import Modal from 'react-native-modal'
import { Ionicons, EvilIcons } from '@expo/vector-icons'
import Ripple from 'react-native-material-ripple'
import { AsyncStorage } from 'react-native'

export default class BillScreen extends Component {
  static navigationOptions = {
    title: 'Bill'
  }

  state = {
    isModalVisible: null,
    currentBillId: null,
    currentBill: null,
    orders: [],
    currentShowingOrderId: null
  }

  componentDidMount () {
    // This event fires every time the navigator focuses this screen.
    // - Fetch the orders
    // - Fetch the bill
    this.props.navigation.addListener('willFocus', route => {
      AsyncStorage.getItem('currentBillId')
        .then(currentBillId => {
          // console.log('====== BILL ======>', currentBillId)
          this.setState({ currentBillId })
          return currentBillId
        })
        .then(currentBillId => {
          this.fetchBillInfo(currentBillId)
          return currentBillId
        })
        .then(currentBillId => this.fetchBillOrders(currentBillId))
    })
  }

  fetchBillInfo = currentBillId => {
    return fetch(
      `https://alfred-waiter.herokuapp.com/api/bills/${currentBillId}`
    )
      .then(response => response.json())
      .then(responseJson => this.setState({ currentBill: responseJson }))
  }

  fetchBillOrders = currentBillId => {
    return fetch(
      `https://alfred-waiter.herokuapp.com/api/bills/${currentBillId}/orders`
    )
      .then(response => response.json())
      .then(responseJson => this.setState({ orders: responseJson }))
  }

  requestBillHandler = () => {
    const { currentBillId } = this.state
    if (!currentBillId) return

    return fetch(
      `https://alfred-waiter.herokuapp.com/api/bills/${currentBillId}`,
      {
        method: 'PATCH',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          printBillRequest: new Date(),
          updatedAt: new Date()
        })
      }
    )
      .then(response => response.json())
      .then(() => Alert.alert('Success', 'Printed bill successfully requested'))
  }

  renderSectionHeader = ({ section }) => {
    return <SectionHeader title={section.title} />
  }

  renderOrderItem = ({ item: { amount, item }, index, section }) => {
    const {
      foodItem,
      foodImage,
      foodItemInfo,
      foodTitle,
      foodTag,
      foodPrice,
      activeItem,
      foodOrderImage
    } = styles
    return (
      <View style={[foodItem]}>
        <Image
          style={foodOrderImage}
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
            <Text style={foodPrice}>{item.currency + ' ' + item.price}</Text>
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
      modalPricesContainer
    } = styles
    const { orders, currentShowingOrderId } = this.state
    if (!currentShowingOrderId) {
      return <View style={modalContent}>No current showing order</View>
    }
    const order = orders.find(e => e.id === currentShowingOrderId)
    if (!order) {
      return <View style={modalContent}>No order</View>
    }
    const { subtotal, taxes, total } = this.computePrices(order.items)
    return (
      <View style={modalContent}>
        <View style={modalHeader}>
          <Text style={{ fontSize: 20, color: '#666', marginLeft: 5 }}>
            Order summary
          </Text>
        </View>
        <ScrollView style={foodGrid}>
          <SectionList
            sections={order.items}
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

  computePrices (order) {
    if (!order || order.length === 0) {
      return {
        subtotal: 0,
        taxes: 0,
        total: 0
      }
    }
    const subtotal = order
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

  countItems (order) {
    if (!order || order.length === 0) return 0
    return order
      .map(section =>
        section.data.map(i => i.amount).reduce((a, b) => a + b, 0)
      )
      .reduce((a, b) => a + b, 0)
  }

  goToHome = (reset = false) => {
    const { navigate } = this.props.navigation
    if (reset) navigate('Home', { closeSession: true })
    else navigate('Home', {})
  }

  render () {
    const {
      foodGrid,
      modalPrices,
      modalPricesContainer,
      buttonRequestBill,
      buttonCloseSession,
      rippleText
    } = styles
    const { orders, currentBill, isModalVisible, currentBillId } = this.state

    if (!currentBillId || !orders || !currentBill) {
      return <UndefinedBill navFunction={this.goToHome} />
    }

    // const { subtotal, taxes, total } = this.computeBillPrices()
    // console.log(this.computePrices())
    return (
      <View style={{ backgroundColor: '#fff', height: '100%' }}>
        <Modal
          isVisible={isModalVisible === 2}
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
            data={orders}
            keyExtractor={(item, index) => item.id}
            renderItem={({ item }) => (
              <View
                style={{
                  padding: 10,
                  marginBottom: 5,
                  borderBottomWidth: 1,
                  borderColor: '#e5e5e5',
                  width: '100%',
                  flexDirection: 'row',
                  alignItems: 'center'
                }}
              >
                <Image
                  style={{
                    width: 70,
                    height: 70
                  }}
                  source={{
                    uri:
                      'https://static1.squarespace.com/static/524caf98e4b0b5e2e07fd6cc/t/5b89d72c8a922d4be9a23d5d/1535760181457/Order.png'
                  }}
                />
                <View
                  style={{
                    marginLeft: 5,
                    flexDirection: 'column',
                    flex: 1,
                    justifyContent: 'space-between'
                  }}
                >
                  <Text style={{ color: '#99989F', fontSize: 8 }}>
                    Order #{item.id}
                  </Text>
                  <Text
                    style={{
                      color: '#6d6d6d',
                      fontWeight: 'bold',
                      fontSize: 22
                    }}
                  >
                    {this.countItems(item.items)} items
                  </Text>
                  <Text
                    style={{
                      color: '#6d6d6d',
                      fontWeight: 'bold',
                      fontSize: 11
                    }}
                  >
                    {format(item.createdAt, 'hh:mm a')}
                  </Text>
                </View>
                <View
                  style={{
                    flexDirection: 'column',
                    flex: 1,
                    justifyContent: 'space-between',
                    alignItems: 'flex-end'
                  }}
                >
                  <Text
                    style={{ color: '#007aff', fontWeight: 'bold' }}
                    onPress={() => {
                      this.setState(
                        this.setState({
                          isModalVisible: 2,
                          currentShowingOrderId: item.id
                        })
                      )
                    }}
                  >
                    Details
                  </Text>
                  <Text
                    style={{
                      color: '#6d6d6d',
                      fontWeight: 'bold',
                      fontSize: 17
                    }}
                  >
                    CRC {this.computePrices(item.items).total}
                  </Text>
                </View>
              </View>
            )}
          />
        </ScrollView>
        <View style={modalPricesContainer}>
          <View style={modalPrices}>
            <Text>Subtotal: </Text>
            <Text>CRC {currentBill.subtotal} </Text>
          </View>
          <View style={modalPrices}>
            <Text>Taxes (13%): </Text>
            <Text>CRC {currentBill.tax} </Text>
          </View>
          <View style={modalPrices}>
            <Text>Total: </Text>
            <Text>CRC {currentBill.total} </Text>
          </View>
        </View>
        <Ripple
          rippleColor={'#rgba(255,255,255,0.8)'}
          rippleContainerBorderRadius={20}
          style={buttonRequestBill}
          onPress={this.requestBillHandler}
        >
          <Text style={rippleText}>Request Bill</Text>
        </Ripple>
        <Ripple
          rippleColor={'#rgba(255,255,255,0.8)'}
          rippleContainerBorderRadius={20}
          style={buttonCloseSession}
          onPress={() => {
            AsyncStorage.removeItem('currentBillId')
            this.goToHome(true)
          }}
        >
          <Text style={rippleText}>Close Session</Text>
        </Ripple>
      </View>
    )
  }
}

const UndefinedBill = ({ navFunction }) => {
  const {
    container,
    splashContainer,
    splashTextContainer,
    errorText,
    buttonMenu,
    textMenuButton
  } = styles
  return (
    <View style={container}>
      <View style={splashContainer}>
        <Ionicons
          name={
            Platform.OS === 'ios'
              ? `ios-information-circle-outline`
              : 'md-information-circle-outline'
          }
          size={150}
          color="#007aff"
        />
      </View>
      <View style={splashTextContainer}>
        <Text style={errorText}>You don't have a bill yet!</Text>
      </View>
      <TouchableOpacity
        style={buttonMenu}
        onPress={navFunction}
        accessibilityLabel="Go to Home"
      >
        <Text style={textMenuButton}> Go to Home </Text>
      </TouchableOpacity>
      <StatusBar hidden />
    </View>
  )
}

const SectionHeader = ({ title }) => {
  const { sectionHeaderContainer, sectionHeaderText } = styles
  return (
    <View style={sectionHeaderContainer}>
      <Text style={sectionHeaderText}>{title}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  foodOrderImage: {
    width: 60,
    height: 60,
    resizeMode: 'cover',
    borderRadius: 5,
    flex: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2
  },
  foodPrice: {
    fontWeight: 'bold',
    color: '#8282A8'
  },
  sectionHeaderContainer: {
    backgroundColor: '#fbfbfb',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#ededed'
  },
  sectionHeaderText: {
    fontSize: 14,
    color: '#8282A8'
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff'
  },
  splashContainer: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20
  },
  splashTextContainer: {
    alignItems: 'center',
    marginHorizontal: 50
  },
  errorText: {
    fontSize: 17,
    color: 'rgba(96,100,109, 1)',
    lineHeight: 24,
    textAlign: 'justify'
  },
  buttonMenu: {
    alignItems: 'center',
    backgroundColor: '#fff',
    marginTop: 20
  },
  textMenuButton: {
    color: '#007aff',
    fontSize: 20,
    lineHeight: 20,
    fontStyle: 'italic'
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
  buttonRequestBill: {
    borderRadius: 20,
    backgroundColor: '#8282A8',
    marginRight: 15,
    marginLeft: 15,
    marginTop: 5,
    marginBottom: 5,
    padding: 10
  },
  buttonCloseSession: {
    borderRadius: 20,
    backgroundColor: '#99989F',
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
  }
})

String.prototype.toPascalCase = function () {
  return this.match(/[a-z]+/gi)
    .map(function (word) {
      return word.charAt(0).toUpperCase() + word.substr(1).toLowerCase()
    })
    .join('')
}
