import React, { Component } from 'react'
import {
  Alert,
  Platform,
  Dimensions,
  LayoutAnimation,
  Text,
  View,
  StatusBar,
  StyleSheet,
  Image,
  TouchableOpacity,
  AsyncStorage
} from 'react-native'
import { BarCodeScanner, Permissions } from 'expo'
import { Ionicons } from '@expo/vector-icons'

let timer = null

export default class HomeScreen extends Component {
  static navigationOptions = {
    header: null
  }
  state = {
    hasCameraPermission: null,
    scannedTableId: null,
    currentBillId: null,
    isLoading: null,
    menu: null,
    franchise: null,
    error: null
  }

  componentDidMount () {
    this.requestCameraPermission()
    this.props.navigation.addListener('willFocus', route => {
      if (this.props.navigation.getParam('closeSession')) {
        clearTimeout(timer)
        this.props.navigation.setParams({ closeSession: false })
        this.setState({
          franchise: null,
          currentBillId: null,
          isLoading: null,
          menu: null,
          error: null
        })
      }
    })
  }

  requestCameraPermission = async () => {
    const { status } = await Permissions.askAsync(Permissions.CAMERA)
    this.setState({
      hasCameraPermission: status === 'granted'
    })
  }

  expireError = () =>
    setTimeout(() => {
      this.setState({ error: null })
    }, 3000)

  handleBarCodeRead = result => {
    const { scannedTableId, isLoading } = this.state
    const tableId = result.data.substring(7, result.data.length)

    if (!isLoading) {
      LayoutAnimation.spring()
      this.setState(
        {
          isLoading: true,
          scannedTableId: tableId
        },
        this.fetchTableInfo
      )
    }
  }

  fetchTableInfo = () => {
    const { scannedTableId, isTaken } = this.state
    return fetch(
      `https://alfred-waiter.herokuapp.com/api/tables/${scannedTableId}/currentBill`
    )
      .then(response => response.json())
      .then(responseJson => {
        if (responseJson.error) throw responseJson.error

        // FIXME: Uncomment this then. It is commented for testing purposes
        // There is already a currentBill in that table
        // if (Object.keys(responseJson).length !== 0) {
        //   throw {
        //     message:
        //       'This table appears to be taken. Please contact your waiter'
        //   }
        // }
        return scannedTableId
      })
      .then(() => this.createBillAndUpdateTable())
      .then(() => this.fetchRestaurant())
      .then(() => this.fetchMenu())
      .then(() => this.setState({ isLoading: false, error: null }))
      .catch(error => {
        console.log(error)
        this.setState(
          {
            error: error,
            isLoading: false
          },
          this.expireError
        )
      })
  }

  createBillAndUpdateTable = () => {
    const { scannedTableId } = this.state
    return fetch('https://alfred-waiter.herokuapp.com/api/bills', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        client: {
          platform: Platform.OS
        }
      })
    })
      .then(response => response.json())
      .then(responseJson => {
        this.setState({ currentBillId: responseJson.id })
        AsyncStorage.setItem('currentBillId', responseJson.id)
        return fetch(
          `https://alfred-waiter.herokuapp.com/api/tables/${scannedTableId}`,
          {
            method: 'PATCH',
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              currentBillId: responseJson.id,
              updatedAt: new Date()
            })
          }
        )
      })
  }

  fetchRestaurant = () => {
    const { scannedTableId } = this.state
    return fetch(
      `http://alfred-waiter.herokuapp.com/api/tables/${scannedTableId}/franchise`
    )
      .then(response => response.json())
      .then(responseJson => {
        this.setState({
          franchise: responseJson
        })
      })
  }

  fetchMenu = () => {
    const { scannedTableId } = this.state
    return fetch(
      `http://alfred-waiter.herokuapp.com/api/tables/${scannedTableId}/menu`
    )
      .then(response => response.json())
      .then(responseJson => {
        // console.log({responseJson});
        this.setState({
          menu: responseJson
        })
      })
  }

  goToMenu = () => {
    const { navigate } = this.props.navigation
    const { menu, franchise, currentBillId, scannedTableId } = this.state
    navigate('Menu', {
      menu,
      franchise,
      currentBillId,
      tableId: scannedTableId
    })
  }

  render () {
    const { isLoading, hasCameraPermission, franchise, error } = this.state
    const { containerPrincipal, cameraImage } = styles

    if (isLoading === true) return <LoadingScreen />
    if (error !== null) return <ErrorScreen error={error} />
    if (franchise !== null) {
      return <SuccessScreen franchise={franchise} navFunction={this.goToMenu} />
    }

    return (
      <View style={containerPrincipal}>
        {hasCameraPermission === null ? (
          <Text>Requesting for camera permission</Text>
        ) : hasCameraPermission === false ? (
          <Text style={{ color: '#fff' }}>
            Camera permission is not granted
          </Text>
        ) : (
          <BarCodeScanner
            onBarCodeRead={this.handleBarCodeRead}
            style={{
              height: Dimensions.get('window').height,
              width: Dimensions.get('window').width
            }}
          >
            <Image
              source={require('../assets/images/scan-splash.png')}
              style={cameraImage}
            />
          </BarCodeScanner>
        )}

        <StatusBar hidden />
      </View>
    )
  }
}

const LoadingScreen = () => {
  const {
    container,
    splashContainer,
    loadingImage,
    splashTextContainer,
    splashText
  } = styles
  return (
    <View style={container}>
      <View style={splashContainer}>
        <Image
          source={require('../assets/images/loading.gif')}
          style={loadingImage}
        />
      </View>

      <View style={splashTextContainer}>
        <Text style={splashText}>Loading...</Text>
      </View>

      <StatusBar hidden />
    </View>
  )
}

const ErrorScreen = ({ error }) => {
  const { container, splashContainer, splashTextContainer, errorText } = styles
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
        <Text style={errorText}>{error.message}</Text>
      </View>
      <StatusBar hidden />
    </View>
  )
}

const SuccessScreen = ({ franchise, navFunction }) => {
  const {
    container,
    splashContainer,
    splashTextContainer,
    splashText,
    buttonMenu,
    textMenuButton
  } = styles
  timer = setTimeout(() => {
    navFunction()
  }, 1000)
  return (
    <View style={container}>
      <View style={splashContainer}>
        <Ionicons
          name={
            Platform.OS === 'ios'
              ? `ios-checkmark-circle`
              : 'md-checkmark-circle'
          }
          size={150}
          color="green"
        />
      </View>
      <View style={splashTextContainer}>
        <Text style={splashText}>{franchise.name}</Text>
      </View>
      <TouchableOpacity
        style={buttonMenu}
        onPress={navFunction}
        accessibilityLabel="Go to Menu"
      >
        <Text style={textMenuButton}> Go to Menu </Text>
      </TouchableOpacity>
      <StatusBar hidden />
    </View>
  )
}

const styles = StyleSheet.create({
  containerPrincipal: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000'
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff'
  },
  cameraImage: {
    position: 'relative',
    flex: 1,
    height: Dimensions.get('window').height,
    width: Dimensions.get('window').width
  },
  splashContainer: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20
  },
  loadingImage: {
    width: 100,
    height: 80,
    resizeMode: 'contain',
    marginTop: 3,
    marginLeft: -10
  },
  splashTextContainer: {
    alignItems: 'center',
    marginHorizontal: 50
  },
  splashText: {
    fontSize: 25,
    color: 'rgba(96,100,109, 1)',
    lineHeight: 24,
    textAlign: 'center',
    fontStyle: 'italic'
  },
  errorText: {
    fontSize: 17,
    color: 'rgba(96,100,109, 1)',
    lineHeight: 24,
    textAlign: 'justify'
  },
  rightText: {
    fontSize: 17,
    color: 'rgba(96,100,109, 1)',
    lineHeight: 24,
    textAlign: 'right'
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
  }
})
