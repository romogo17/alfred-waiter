import React, {Component} from 'react';
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
  Button
} from 'react-native';
import {BarCodeScanner, Permissions} from 'expo';
import { Ionicons } from '@expo/vector-icons';

export default class HomeScreen extends Component {
  static navigationOptions = {
    header: null,
  };
  state = {
    hasCameraPermission: null,
    lastTableId: null,
    isTaken: null,
    isLoading: null,
    restaurantName: null,
    dataSource: null
  };

  componentDidMount() {
    this.requestCameraPermission();
  }

  requestCameraPermission = async () => {
    const {status} = await Permissions.askAsync(Permissions.CAMERA);
    this.setState({
      hasCameraPermission: status === 'granted',
    });
  };

  handleBarCodeRead = result => {
    const {lastTableId} = this.state
    const tableId = result.data.substring(7, result.data.length)
    if (tableId !== lastTableId) {
      LayoutAnimation.spring();
      this.setState({
        lastTableId: result.data.substring(7, result.data.length),
        isLoading: true,
      });
    }
  };

  render() {
    //Puede funcionar para cuando se haga lo del pedido y que la mesa ya no esta ocupada.
    // const { navigation } = this.props;
    // const isLoading = navigation.getParam('isLoading');
    // const isTaken = navigation.getParam('isTaken');
    // console.log("loading "+isLoading+" taken " + isTaken)
    if(this.state.isLoading === null){
      return (
        <View style={styles.containerPrincipal}>
          {this.state.hasCameraPermission === null ? (
            <Text>Requesting for camera permission</Text>
          ) : this.state.hasCameraPermission === false ? (
            <Text style={{color: '#fff'}}>Camera permission is not granted</Text>
          ) : (
            <BarCodeScanner
              onBarCodeRead={this.handleBarCodeRead}
              style={{
                height: Dimensions.get('window').height,
                width: Dimensions.get('window').width,
              }}
            >
              <Image
                source={require('../assets/images/scan-splash.png')}
                style={styles.cameraImage}
              />
            </BarCodeScanner>
          )}

          {this.maybeRenderUrl()}

          <StatusBar hidden />
        </View>
      );
    }else{
      if(this.state.isLoading === true){
        //Loading
        return (
          <View style={styles.container}>
              <View style={styles.welcomeContainer}>
                <Image
                  source={require('../assets/images/loading.gif')}
                  style={styles.loadingImage}
                />
              </View>
    
              <View style={styles.getStartedContainer}>
                <Text style={styles.getStartedText}>Loading...</Text>
              </View>
              {this.maybeRenderUrl()}

              <StatusBar hidden />
          </View>
        );
      }else{
        if(this.state.isTaken === true){
          //Taken
          return (
            <View style={styles.container}>
                <View style={styles.welcomeContainer}>
                  <Ionicons name={ Platform.OS === 'ios' ? `ios-close-circle` : 'md-close-circle' } size={150} color="red" />
                </View>
      
                <View style={styles.getStartedContainer}>
                  <Text style={styles.errorText}>This table is taken, plase try another one.{"\n"}Thanks.</Text>
                  <Text style={styles.rightText}>&nbsp; – {this.state.restaurantName}</Text>
                </View>
                {this.maybeRenderUrl()}
        
                <StatusBar hidden />
            </View>
          );
        }else{
          //Welcome
          return (
            <View style={styles.container}>
                <View style={styles.welcomeContainer}>
                  <Ionicons name={ Platform.OS === 'ios' ? `ios-checkmark-circle` : 'md-checkmark-circle' } size={150} color="green" />
                </View>
      
                <View style={styles.getStartedContainer}>
                  <Text style={styles.getStartedText}>Welcome to: {"\n"}{this.state.restaurantName}</Text> 
                </View>
                {this.maybeRenderUrl()}

                <Button
                  onPress={this.gotoMenu}
                  title="Go to Menu"
                  accessibilityLabel="Go to Menu"
                  style={styles.buttonMenu}
                />

              <StatusBar hidden />
            </View>
          );
        }
      }
    }
  }

  handleCode = (tableId) => {
    console.log({tableId})
    if(this.state.isTaken === null){
      return fetch(`http://alfred-waiter.herokuapp.com/api/tables/${tableId}/currentBill`)
        .then((response) => response.json())
        .then((responseJson) => {
          console.log(responseJson)
          // this.setState({
          //   dataSource: responseJson,
          // });
          
          if(Object.keys(responseJson).length !== 0){
            this.setState({
              isTaken: true,
              isLoading: false,
            })
          }else{
            this.setState({
              isTaken: false,
              isLoading: false,
            })
          }
          console.log('taken '+this.state.isTaken)
          console.log('loading '+this.state.isLoading)
            // hacer el otro fetch 
            // .then(menu => navegar a la otra vista)
          fetch(`http://alfred-waiter.herokuapp.com/api/tables/${tableId}/franchise`)
          .then((response) => response.json())
          .then((responseJson) => {
            console.log(responseJson)
            this.setState({
              restaurantName: responseJson.name,
            });
            console.log('restaurant '+this.state.restaurantName)
          })
          .catch((error) =>{
            console.error(error);
          });
        })
        .catch((error) =>{
          console.error(error);
        });
    }
  };

  maybeRenderUrl = () => {
    if (!this.state.lastTableId) {
      return;
    }

    console.log(this.state.lastTableId)
    this.handleCode(this.state.lastTableId)
  };

  gotoMenu = () => {
    const {navigate} = this.props.navigation
    navigate('Menu', {tableId: this.state.lastTableId})
  };
}

const styles = StyleSheet.create({
  containerPrincipal: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  cameraImage: {
    position: 'relative',
    flex: 1,
    height: Dimensions.get('window').height,
    width: Dimensions.get('window').width,
  },
  welcomeContainer: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  loadingImage: {
    width: 100,
    height: 80,
    resizeMode: 'contain',
    marginTop: 3,
    marginLeft: -10,
  },
  getStartedContainer: {
    alignItems: 'center',
    marginHorizontal: 50,
  },
  getStartedText: {
    fontSize: 25,
    color: 'rgba(96,100,109, 1)',
    lineHeight: 24,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  errorText: {
    fontSize: 17,
    color: 'rgba(96,100,109, 1)',
    lineHeight: 24,
    textAlign: 'justify',
  },
  rightText: {
    fontSize: 17,
    color: 'rgba(96,100,109, 1)',
    lineHeight: 24,
    textAlign: 'right',
  },
  buttonMenu: {
    backgroundColor: "#fff",
    color: "#86b0f4",
  },
});
