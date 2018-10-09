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
} from 'react-native';
import {BarCodeScanner, Permissions} from 'expo';
import {Ionicons} from '@expo/vector-icons';

export default class HomeScreen extends Component {
  static navigationOptions = {
    header: null
  }
  state = {
    hasCameraPermission: null,
    scannedTableId: null,
    isLoading: null,
    menu: null,
    franchise: null,
    error: null
  }

  componentDidMount () {
    this.requestCameraPermission()
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
      `http://alfred-waiter.herokuapp.com/api/tables/${scannedTableId}/currentBill`
    )
      .then(response => response.json())
      .then(responseJson => {
        if (responseJson.error) throw responseJson.error

        // There is already a currentBill in that table
        if (Object.keys(responseJson).length !== 0) {
          throw {
            message:
              'This table appears to be taken. Please contact your waiter'
          }
        }
        return scannedTableId
      })
      .then(() => this.fetchRestaurant())
      .then(() => this.fetchMenu())
      .then(() => this.setState({ isLoading: false, error: null }))
      .catch(error => {
        this.setState(
          {
            error: error,
            isLoading: false
          },
          this.expireError
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
    const { menu, franchise } = this.state
    navigate('Menu', { menu: menu, franchise })
  }

  render () {
    const { isLoading, hasCameraPermission, franchise, error } = this.state
    const { containerPrincipal, cameraImage } = styles

    if (isLoading === true) return <LoadingScreen />
    if (error !== null) return <ErrorScreen error={error} />
    if (franchise !== null) { return <SuccessScreen franchise={franchise} navFunction={this.goToMenu} /> }

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
    buttonMenu
  } = styles
  setTimeout(() => {
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
        style={styles.buttonMenu}
        onPress={navFunction}
        accessibilityLabel="Go to Menu"
      >
        <Text style={styles.textMenuButton}> Go to Menu </Text>
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
    marginTop: 20,
  },
  textMenuButton: {
    color: '#007aff',
    fontSize: 20,
    lineHeight: 20,
    fontStyle: 'italic'
  },
});
