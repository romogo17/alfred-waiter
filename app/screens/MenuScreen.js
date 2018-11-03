import React from 'react'
import {
  ScrollView,
  StyleSheet,
  Image,
  SectionList,
  Text,
  View,
  TouchableOpacity,
  TouchableHighlight,
  Platform,
  Alert,
  StatusBar
} from 'react-native'
import Modal from 'react-native-modal'
import { Ionicons, EvilIcons } from '@expo/vector-icons'
import Ripple from 'react-native-material-ripple'
import { AsyncStorage } from "react-native"

export default class MenuScreen extends React.Component {
  static navigationOptions = {
    title: 'Menu'
  }

  // If the menu exists, initialize the order as a copy of the menu
  // with each item ordered an amount of 0 times
  state = {
    order: this.props.navigation.getParam('menu')
      ? this.props.navigation.getParam('menu').data.map(section => ({
        ...section,
        data: section.data.map(item => ({ amount: 0, item }))
      }))
      : null,
    prunedOrder: null,
    observations: '',
    menu: this.props.navigation.getParam('menu'),
    isModalVisible: null,
    orders: []
  }

  componentDidUpdate () {
    const { order } = this.state
    if (order === null) {
      this.setState({
        order: this.props.navigation.getParam('menu').items.map(item => ({
          amount: 0,
          item
        }))
      })
    }
  }

  pruneOrder () {
    const { order } = this.state
    if (!order) return []
    return order
      .map(section => ({
        ...section,
        data: section.data.filter(item => item.amount > 0)
      }))
      .filter(section => section.data.length > 0)
  }

  computePrices () {
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

  handleQuantityChange = (index, section, action) => {
    const { menu, order } = this.state

    const sectionIndex = order.findIndex(s => s.title === section.title)

    if (action === ItemAction.PLUS) order[sectionIndex].data[index].amount++
    else if (order[sectionIndex].data[index].amount > 0) {
      order[sectionIndex].data[index].amount--
    }

    this.setState({ order: order })
  }

  renderMenuItem = ({ item: { amount, item }, index, section }) => {
    const {
      foodItem,
      foodImage,
      foodItemInfo,
      foodTitle,
      foodTag,
      activeItem
    } = styles
    return (
      <View style={[foodItem, amount !== 0 && activeItem]}>
        <Image
          style={foodImage}
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
          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              marginTop: 10
            }}
          >
            {item.tags &&
              item.tags.map(t => (
                <Text key={t} style={foodTag}>
                  {t}
                </Text>
              ))}
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
          <TouchableOpacity
            onPress={() =>
              this.handleQuantityChange(index, section, ItemAction.PLUS)
            }
          >
            <Ionicons name="ios-add-circle" color="#8282A8" size={30} />
          </TouchableOpacity>
          <View>
            <Text style={{ padding: 5, color: '#555' }}>{amount}</Text>
          </View>
          <TouchableOpacity
            onPress={() =>
              this.handleQuantityChange(index, section, ItemAction.MINUS)
            }
          >
            <Ionicons name="ios-remove-circle" color="#8282A8" size={30} />
          </TouchableOpacity>
        </View>
      </View>
    )
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

  goToHome = () => {
    const { navigate } = this.props.navigation
    const { menu, franchise } = this.state
    navigate('Home', {})
  }

  renderSectionHeader = ({ section }) => {
    return <SectionHeader title={section.title} />
  }

  _storeData = async (orden) => {
    this._retrieveData()
    let a = this.state.orders.slice() //creates the clone of the state
    a.push(orden)
    this.setState({orders: a})
    // console.log(this.state.orders)
    try {
      await AsyncStorage.setItem('orders', JSON.stringify(this.state.orders))
    } catch (error) {
      // Error saving data
      console.log(error.message)
    }
  }

  _retrieveData = async () => {
    try {
      const value = await AsyncStorage.getItem('orders')
      if (value !== null) {
        // We have data!!
        console.log(value);
        this.setState({orders: value})
      }else{
        this.setState({orders: []})
      }
     } catch (error) {
       // Error retrieving data
       console.log(error.message)
     }
  }

  renderModalContent = () => {
    const {
      modalContent,
      modalHeader,
      foodGrid,
      buttonPlaceOrder,
      modalPrices,
      modalPricesContainer,
      rippleText
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

        <Ripple
          rippleColor={'#rgba(255,255,255,0.8)'}
          rippleContainerBorderRadius={20}
          style={buttonPlaceOrder}
          onPress={() => {
            this.setState({ isModalVisible: null })
            this._storeData(prunedOrder)
          }}
        >
          <Text style={rippleText}>Confirm</Text>
        </Ripple>
      </View>
    )
  }

  render () {
    const { menu, order } = this.state
    const {
      foodGrid,
      buttonPlaceOrder,
      modalContainer,
      isModalVisible,
      rippleText
    } = styles

    if (this.props.navigation.getParam('menu') === undefined) {
      return <UndefinedMenu navFunction={this.goToHome} />
    }

    return (
      <View style={{ backgroundColor: '#fff', height: '100%' }}>
        <Modal
          isVisible={this.state.isModalVisible === 2}
          transparent={true}
          animationIn={'slideInLeft'}
          animationOut={'slideOutRight'}
          onBackdropPress={() => {
            this.setState({ isModalVisible: null })
            this._storeData()
          }}
        >
          {this.renderModalContent()}
        </Modal>

        <ScrollView style={foodGrid}>
          <SectionList
            sections={order} // Use the order instead of the menu for easier access to the amount
            keyExtractor={({ amount, item }, index) =>
              index + item.name.toPascalCase()
            }
            extraData={this.state}
            renderItem={this.renderMenuItem}
            renderSectionHeader={this.renderSectionHeader}
          />
        </ScrollView>

        <Ripple
          rippleColor={'#rgba(255,255,255,0.8)'}
          rippleContainerBorderRadius={20}
          style={buttonPlaceOrder}
          onPress={() => {
            this.setState({ prunedOrder: this.pruneOrder() }, () => {
              if (this.state.prunedOrder.length === 0) {
                Alert.alert(
                  'Empty order',
                  "You haven't added any menu items yet"
                )
              } else this.setState({ isModalVisible: 2 })
            })
          }}
        >
          <Text style={rippleText}>Place Order</Text>
        </Ripple>
      </View>
    )
  }
}

const SectionHeader = ({ title }) => {
  const { sectionHeaderContainer, sectionHeaderText } = styles
  return (
    <View style={sectionHeaderContainer}>
      <Text style={sectionHeaderText}>{title}</Text>
    </View>
  )
}

const UndefinedMenu = ({ navFunction }) => {
  const {
    container,
    splashContainer,
    splashTextContainer,
    errorText,
    buttonMenu,
    textMenuButton
  } = styles
  setTimeout(() => {
    navFunction()
  }, 2000)
  return (
    <View style={container}>
      <View style={splashContainer}>
        <Ionicons
          name={Platform.OS === 'ios' ? `ios-close-circle` : 'md-close-circle'}
          size={150}
          color="red"
        />
      </View>
      <View style={splashTextContainer}>
        <Text style={errorText}>You must scan a QR code first.</Text>
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
  foodGrid: {
    flex: 1,
    backgroundColor: '#fff',
    flexDirection: 'column',
    height: '100%'
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
  foodTitle: {
    fontWeight: 'bold',
    fontSize: 20,
    color: '#555',
    marginBottom: 5
  },
  foodTag: {
    borderWidth: 1,
    borderRadius: 4,
    backgroundColor: '#fff',
    borderColor: '#bbb',
    color: '#DB4073',
    padding: 4,
    minWidth: 30,
    textAlign: 'center',
    marginRight: 3
  },
  foodPrice: {
    fontWeight: 'bold',
    color: '#8282A8'
  },
  foodImage: {
    width: 100,
    height: 100,
    resizeMode: 'cover',
    borderRadius: 5,
    flex: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2
  },
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

String.prototype.toPascalCase = function () {
  return this.match(/[a-z]+/gi)
    .map(function (word) {
      return word.charAt(0).toUpperCase() + word.substr(1).toLowerCase()
    })
    .join('')
}

var ItemAction = {
  PLUS: 'plus',
  MINUS: 'minus'
}
