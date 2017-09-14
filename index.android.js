
import React, { PropTypes, } from 'react';
import { Dimensions, View, Text, StyleSheet, TouchableHighlight, ScrollView, Image, Component, AppRegistry, ActivityIndicator } from "react-native";
import MapView from 'react-native-maps';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import LocationServicesDialogBox from "react-native-android-location-services-dialog-box";
import Icon from 'react-native-vector-icons/MaterialIcons';
import Polyline from '@mapbox/polyline';

const { width, height } = Dimensions.get('window')

class sample extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      region: {
        latitude: null,
        longitude: null,
        latitudeDelta: null,
        longitudeDelta: null
      },
      region2: {
        latitude: null,
        longitude: null,
        fetchDetails: false
      },
      loading: false,
      coords: [],
      myLocation: {
        latitude: null,
        longitude: null,
        latitudeDelta: null,
        longitudeDelta: null
      },
    }
  }

  // fetch directions and decode polylines
  async getDirections(startLoc, destinationLoc) {
    // console.log("get direction funtion run")
    try {
      let key = 'AIzaSyCSDc8XUj2qEpzcStMWgHQVUpXel_v4kOg'
      let resp = await fetch(`https://maps.googleapis.com/maps/api/directions/json?origin=${startLoc}&destination=${destinationLoc}&key=AIzaSyCSDc8XUj2qEpzcStMWgHQVUpXel_v4kOg`)
      // console.log(resp, "res hai get direction ka")
      let respJson = await resp.json();
      // console.log(respJson, "respJson")
      let points = Polyline.decode(respJson.routes[0].overview_polyline.points);
      // console.log(points, "points points")
      let coords = points.map((point, index) => {
        return {
          latitude: point[0],
          longitude: point[1]
        }
      })
      // console.log(coords, "cooooooooorrrrddddd")
      this.setState({ coords: coords })
      return coords
    } catch (error) {
      return (error) => { console.log(error, 'error error error') }
    }
  }

  calcDelta = (lat, lon, accuracy) => {
    //console.log(lat, lon, accuracy, "lat, lon, accuracy lat, lon, accuracy")
    const oneDegreeLongitudeInMeters = 111.32;
    const circumference = (40075 / 360)
    const latDelta = accuracy * (1 / (Math.cos(lat) * circumference))
    const lonDelta = (accuracy / oneDegreeLongitudeInMeters)
    this.setState({
      region: {
        latitude: lat,
        longitude: lon,
        latitudeDelta: latDelta,
        longitudeDelta: lonDelta
      },
      myLocation: {
        latitude: lat,
        longitude: lon,
        latitudeDelta: latDelta,
        longitudeDelta: lonDelta
      }
    })
  }

  directionGet() {
    // console.log("directionGet work")
    const startLoc = this.state.region2.latitude + "," + this.state.region2.longitude
    const endLoc = this.state.region.latitude + "," + this.state.region.longitude
    // console.log(startLoc, "startLoc", endLoc, "endLoc")
    this.getDirections(startLoc, endLoc)
  }

  componentDidMount() {

    LocationServicesDialogBox.checkLocationServicesIsEnabled({
      message: "<h2>Use Location ?</h2>This app wants to change your device settings:<br/><br/>Use GPS, Wi-Fi, and cell network for location<br/><br/><a href='#'>Learn more</a>",
      ok: "YES",
      cancel: "NO",
      enableHighAccuracy: true, // true => GPS AND NETWORK PROVIDER, false => ONLY GPS PROVIDER
      showDialog: true // false => Opens the Location access page directly
    }).then(function (success) {
      this.setState({ loading: true })
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.setState({ loading: false })
          const lat = position.coords.latitude
          const lon = position.coords.longitude
          const accuracy = position.coords.accuracy
          this.calcDelta(lat, lon, accuracy)
        },
        (error) => console.log(JSON.stringify(error)),
        { enableHighAccuracy: false, timeout: 20000, maximumAge: 10000 },
      );
    }.bind(this))
      .catch((error) => {
        console.log(error.message);
      });
    this.watchID = navigator.geolocation.watchPosition((position) => {
      this.calcDelta(position.coords.latitude, position.coords.longitude, position.coords.accuracy);
      // console.log(position.coords.latitude, position.coords.longitude, position.coords.accuracy,"position.coords.latitude, position.coords.longitude, position.coords.accuracy, wahtId")
    });
  }
  componentWillUnmount() {
    navigator.geolocation.clearWatch(this.watchID);
  }

  onRegionChange(region) {
    console.log(region, "region region")
    this.setState({ region });
  }

  myLocation(region) {
    const latt = this.state.myLocation.latitude
    const longg = this.state.myLocation.longitude
    const latD = this.state.myLocation.latitudeDelta
    const lonD = this.state.myLocation.longitudeDelta
    console.log(region, "region", latt, longg, "laaattttt loooonnggg")
    this.setState({
      region: {
        latitude: latt,
        longitude: longg,
        latitudeDelta: latD,
        longitudeDelta: lonD
      }
    })
    console.log(this.state.region.latitude, "this.state.latitude", this.state.region.longitude, "this.state.longitude", this.state.region.latitudeDelta, "this.state.region.latitudeDelta", this.state.region.longitudeDelta, "this.state.region.longitudeDelta")

  }




  render() {
    console.log(this.state.region.latitude, "this.state.latitude", this.state.region.longitude, "this.state.longitude", this.state.region.latitudeDelta, "this.state.region.latitudeDelta", this.state.region.longitudeDelta, "this.state.region.longitudeDelta")
    // console.log(this.state.coords, "this.state.coords this.state.coords")
    return (


      <View style={styles.container}>
        {!this.state.loading ? <View style={{ flex: 1, flexDirection: 'column' }}>

          <GooglePlacesAutocomplete
            query={{
              // available options: https://developers.google.com/places/web-service/autocomplete
              key: 'AIzaSyCSDc8XUj2qEpzcStMWgHQVUpXel_v4kOg',
              language: 'en', // language of the results
              types: 'geocode' // default: 'geocode'
            }}
            placeholder='Enter Location'
            minLength={2}
            autoFocus={this.state.region2.fetchDetails}
            returnKeyType={'default'}
            fetchDetails={true}
            renderDescription={(row) => row.description}
            listViewDisplayed='auto'
            onPress={(data, details = null) => {
              this.setState({
                region2: {
                  latitude: details.geometry.location.lat,
                  longitude: details.geometry.location.lng,
                  fetchDetails: true
                }
              })
              // 'details' is provided when fetchDetails = true
              console.log(data);
              console.log(details);
            }}
            styles={{
              textInputContainer: {
                backgroundColor: 'rgba(0,0,0,0)',
                borderTopWidth: 0,
                width: width,
                borderBottomWidth: 0,
                height: 38,
                flex: 0.5,
                zIndex: 1,
                paddingTop: 14,
                paddingLeft: 10,
                paddingRight: 10,
                paddingBottom: 20
              },
              listView: {
                backgroundColor: 'white',
                zIndex: 2,
                marginTop: 0,
                paddingTop: 0,


              },
              textInput: {
                marginLeft: 0,
                marginRight: 0,
                height: 38,
                color: '#5d5d5d',
                fontSize: 16,
              },
              predefinedPlacesDescription: {
                backgroundColor: 'rgba(0,0,0,0)',
              },
              poweredContainer: {
                backgroundColor: 'rgba(0,0,0,0)'
              },
            }}
            currentLocation={false}
          />
          {this.state.region.latitude ?
            <MapView style={styles.map}
              initialRegion={this.state.region}
              region={this.state.region}
              zoomEnabled={true}
              pitchEnabled={true}
              showsUserLocation={true}
              followsUserLocation={true}
              onRegionChange={this.onRegionChange.bind(this)}

            >
              <MapView.Polyline
                coordinates={this.state.coords}
                strokeWidth={6}
                strokeColor="#6495ED" />

              {/*<MapView.Marker
                coordinate={{
                  latitude: this.state.region.latitude,
                  longitude: this.state.region.longitude,
                }}
              >
                <View style={styles.radius}>
                  <View style={styles.marker} />
                </View>
              </MapView.Marker>*/}


              {this.state.region2.fetchDetails ? <MapView.Marker
                coordinate={{
                  latitude: this.state.region2.latitude,
                  longitude: this.state.region2.longitude,
                }}>

              </MapView.Marker> : null}



            </MapView> : null}
          {/*<View style={{ flexGrow: 1 }}>
          <Text>Latitude: {this.state.region.latitude}</Text>
          <Text>Longitude: {this.state.region.longitude}</Text>
        </View>*/}
          <View style={{ alignSelf: 'flex-end', margin: 10, marginBottom: 30, bottom: 40 }}>
            <View style={styles.go} >
              <Icon name="directions" backgroundColor="#3b5998" color="white" size={15}
                onPress={this.directionGet.bind(this)}><Text>{"\n"}GO</Text></Icon>
            </View>
            <View style={styles.location}>
              <Icon name="my-location" backgroundColor="#3b5998" color="white" size={25}
                backgroundColor="#3b5998" onPress={this.myLocation.bind(this)}></Icon>
            </View>
          </View>



          <View style={styles.footer}>
            <TouchableHighlight style={styles.bottomButtons} onPress={this.handleGetDirections}>
              <Text style={styles.footerText}>FOOTER</Text>
            </TouchableHighlight>
          </View>

        </View> :
          <ActivityIndicator
            animating={this.state.animating}
            style={[styles.centering, { height: 80 }]}
            size="large"
          />}



      </View>


      /*<View style={styles.mainviewStyle}>
        <View style={styles.header}>
          <TouchableHighlight style={styles.bottomButtons}>
            <Text style={styles.footerText}>HEADER</Text>
          </TouchableHighlight>
        </View>



        <ContainerView />
        <View style={styles.footer}>
          <TouchableHighlight style={styles.bottomButtons}>
            <Text style={styles.footerText}>FOOTER</Text>
          </TouchableHighlight>
        </View>
      </View>*/
    );
  }
}

class ContainerView extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <ScrollView style={styles.scrollViewStyle}>
        <View>
          <Text style={styles.textStyle}> Example for ScrollView and Fixed Footer</Text>
        </View>
      </ScrollView>
    );
  }
}

var styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'gray',
    height: height,
    width: width,
  },
  go: {
    backgroundColor: "#3b5998",
    justifyContent: 'center',
    width: 70,
    height: 70,
    borderRadius: 70 / 2,
    alignItems: 'center',
    position: 'relative',
    marginBottom: 10

    // borderColor: 'black',
    // borderWidth: 4,
    // color:"white",

  },
  location: {
    backgroundColor: "#3b5998",
    justifyContent: 'center',
    width: 70,
    height: 70,
    borderRadius: 70 / 2,
    alignItems: 'center',
    position: 'relative'
    // borderColor: 'black',
    // borderWidth: 4,
    // color: 'white',
  },
  map: {
    // left: 0,
    // right: 0,
    // top: 0,
    // bottom: 0,
    flex: 1,
    height: height,
    width: width,
    position: 'absolute'
  },
  mainviewStyle: {
    flex: 1,
    flexDirection: 'column',
  },
  footer: {
    flex: 0.1,
    left: 0,
    right: 0,
    bottom: 10,
    backgroundColor: 'green',
    flexDirection: 'row',
    height: 60,
    alignItems: 'center',
    zIndex: 1,
  },
  header: {
    position: 'absolute',
    flex: 1,
    left: 0,
    right: 0,
    backgroundColor: 'green',
    flexDirection: 'row',
    height: 60,
    alignItems: 'center',
  },
  bottomButtons: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  footerText: {
    color: 'white',
    fontWeight: 'bold',
    alignItems: 'center',
    fontSize: 18,
  },
  textStyle: {
    alignSelf: 'center',
    color: 'orange'
  },
  scrollViewStyle: {
    borderWidth: 2,
    borderColor: 'black'
  },
  radius: {
    height: 50,
    width: 50,
    borderRadius: 50 / 2,
    overflow: 'hidden',
    backgroundColor: 'rgba(0,122,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(0,112,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  marker: {
    height: 20,
    width: 20,
    borderWidth: 3,
    borderColor: 'white',
    borderRadius: 20 / 2,
    overflow: 'hidden',
    backgroundColor: '#007AFF',
  }
});

AppRegistry.registerComponent('sample', () => sample);
