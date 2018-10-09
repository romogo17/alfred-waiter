import React from 'react'
import {
  ScrollView,
  StyleSheet,
  Image,
  FlatList,
  Text,
  View,
  TouchableOpacity,
  Platform,
  Alert,
  Button,
  StatusBar
} from 'react-native'
import { Ionicons, EvilIcons } from '@expo/vector-icons'
import Ripple from 'react-native-material-ripple'

export default class MenuScreen extends React.Component {
  static navigationOptions = {
    title: 'Menu'
  }

  // If the menu exists, initialize the order as a copy of the menu
  // with each item ordered an amount of 0 times
  state = {
    order: this.props.navigation.getParam('menu')
      ? this.props.navigation.getParam('menu').items.map(item => ({
        amount: 0,
        item
      }))
      : null,
    observations: '',
    menu: this.props.navigation.getParam('menu')
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

  handleQuantityChange = (index, action) => {
    const { menu, order } = this.state

    if (action === ItemAction.PLUS) order[index].amount += 1
    else if (order[index].amount > 0) order[index].amount--

    this.setState({ order: order })
  }

  renderMenuItem = ({ item: { amount, item }, index }) => {
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
              : 'https://dummyimage.com/300x300/fff/aaa'
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
            onPress={() => this.handleQuantityChange(index, ItemAction.PLUS)}
          >
            <Ionicons name="ios-add-circle" color="#8282A8" size={30} />
          </TouchableOpacity>
          <View>
            <Text style={{ padding: 5, color: '#555' }}>{amount}</Text>
          </View>
          <TouchableOpacity
            onPress={() => this.handleQuantityChange(index, ItemAction.MINUS)}
          >
            <Ionicons name="ios-remove-circle" color="#8282A8" size={30} />
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  goToHome = () => {
    const { navigate } = this.props.navigation
    const { menu, franchise } = this.state
    navigate('Home', {})
  }

  render () {
    const { menu, order } = this.state
    const { foodGrid, buttonPlaceOrder } = styles

    if (this.props.navigation.getParam('menu') === undefined) {
      return <UndefinedMenu navFunction={this.goToHome} />
    }

    return (
      <View style={{ backgroundColor: '#fff', height: '100%' }}>
        <ScrollView style={foodGrid}>
          <FlatList
            data={order} // Use the order instead of the menu for easier access to the amount
            keyExtractor={({ amount, item }, index) =>
              index + item.name.toPascalCase()
            }
            extraData={this.state}
            renderItem={this.renderMenuItem}
          />
        </ScrollView>
        <Ripple
          rippleColor={'#rgba(255,255,255,0.8)'}
          rippleContainerBorderRadius={20}
          style={buttonPlaceOrder}
          onPress={() =>
            Alert.alert(
              'Your order',
              order
                .map(
                  x =>
                    `${x.amount} x ${x.item.name} (${x.item.currency} ${
                      x.item.price
                    })`
                )
                .join('; ')
            )
          }
        >
          <Text
            style={{
              color: '#fff',
              fontWeight: 'bold',
              fontSize: 20,
              textAlign: 'center'
            }}
          >
            Place Order
          </Text>
        </Ripple>
      </View>
    )
  }
}

const UndefinedMenu = ({ navFunction }) => {
  const {
    container,
    splashContainer,
    splashTextContainer,
    errorText,
    buttonMenu
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
      <Button
        onPress={navFunction}
        title="Go to Home"
        accessibilityLabel="Go to Home"
        style={buttonMenu}
      />
      <StatusBar hidden />
    </View>
  )
}

const styles = StyleSheet.create({
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
    backgroundColor: '#fff',
    color: '#86b0f4'
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
  buttonPlaceOrder: {
    borderRadius: 20,
    backgroundColor: '#5EBA7D',
    marginRight: 15,
    marginLeft: 15,
    marginTop: 5,
    marginBottom: 5,
    padding: 10
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
