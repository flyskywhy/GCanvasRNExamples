import React, {Component} from 'react';
import {Platform, StyleSheet, View} from 'react-native';
import ManageExternalStorage from 'react-native-external-storage-permission';
if (Platform.OS !== 'web') {
  var {PERMISSIONS, request} = require('react-native-permissions').default;
}
import PixelShapeRN from 'pixelshapern/src/index';
import {PixelShapeContext} from 'pixelshapern/src/context';

export default class PixelShape extends Component {
  componentDidMount() {
    if (Platform.OS === 'android') {
      ManageExternalStorage.checkAndGrantPermission().then(granted => {
        if (!granted) {
          console.warn('NoStoragePermissionCanNotSaveOrLoadGifFile');
        }
      });
    }

    if (Platform.OS === 'ios') {
      request(
        Platform.select({
          ios: PERMISSIONS.IOS.PHOTO_LIBRARY,
        }),
      ).then(response => {
        if (response !== 'granted') {
          console.warn('NoStoragePermissionCanNotSaveOrLoadGifFile');
        }
      });
    }
  }

  render() {
    return (
      <View style={styles.container}>
        <PixelShapeContext.Provider value={{}}>
          <PixelShapeRN />
        </PixelShapeContext.Provider>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
});
