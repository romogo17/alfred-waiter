import React, {Component} from 'react';
import {
  Alert,
  Linking,
  Dimensions,
  LayoutAnimation,
  Text,
  View,
  StatusBar,
  StyleSheet,
  Image,
} from 'react-native';
import {BarCodeScanner, Permissions} from 'expo';

export default class HomeScreen extends Component {
  static navigationOptions = {
    header: null,
  };
  state = {
    hasCameraPermission: null,
    lastTableId: null,
    isTaken: null,
    isLoading: null,
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
    const {navigate} = this.props.navigation
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
                  style={styles.welcomeImage}
                />
              </View>
    
              <View style={styles.getStartedContainer}>
                <Text style={styles.getStartedText}>Loading</Text>
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
                  <Image
                    source={require('../assets/images/robot-dev.png')}
                    style={styles.welcomeImage}
                  />
                </View>
      
                <View style={styles.getStartedContainer}>
                  <Text style={styles.getStartedText}>This table is take, plase try another one.</Text>
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
                  <Image
                    source={require('../assets/images/robot-dev.png')}
                    style={styles.welcomeImage}
                  />
                </View>
      
                <View style={styles.getStartedContainer}>
                  <Text style={styles.getStartedText}>Welcome to: restaurantName</Text>
                </View>
              {this.maybeRenderUrl()}

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
        })
        .catch((error) =>{
          console.error(error);
        });
    }
  };

  handlePressCancel = () => {
    this.setState({lastTableId: null});
  };

  maybeRenderUrl = () => {
    if (!this.state.lastTableId) {
      return;
    }

    console.log(this.state.lastTableId)
    this.handleCode(this.state.lastTableId)
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
  welcomeImage: {
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
    fontSize: 17,
    color: 'rgba(96,100,109, 1)',
    lineHeight: 24,
    textAlign: 'center',
  },
});
