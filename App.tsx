/**
 * GCanvas React Native Examples
 * https://github.com/flyskywhy/react-native-gcanvas
 *
 * @format
 * @flow strict-local
 */

import React from 'react';
import {Button, Platform, View, StatusBar} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import Canvas2dDemoScreen from './app/components/Canvas2dDemo';
import RotateRemount2MemoryLeakScreen from './app/components/RotateRemount2MemoryLeak';
import DrawCanvas2CanvasScreen from './app/components/DrawCanvas2Canvas';
import FontPicker2FillTextScreen from './app/components/FontPicker2FillText';
import ZdogAndTestsScreen from './app/components/ZdogAndTests';
import AudioFrequencyHistogramScreen from './app/components/AudioFrequencyHistogram';
import AudioWaveSurferScreen from './app/components/AudioWaveSurfer';
import Webgl3dTexturesScreen from './app/components/Webgl3dTextures';
import WebglCubeMapsScreen from './app/components/WebglCubeMaps';
import PixiScreen from './app/components/Pixi';
import DragNDropScreen from './src/dragNdrop';
import NonDeclarativeScreen from './src/nonDeclarative';
import PixelShapeScreen from './app/components/PixelShape';
import KonvaScreen from './app/components/Konva';

if (Platform.OS !== 'web') {
  require('react-native').LogBox.ignoreLogs([
    'React Components must start with an uppercase letter',
  ]);
}

function HomeScreen({navigation}) {
  return (
    <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
      <Button
        title="Canvas 2d Demo"
        onPress={() => navigation.navigate('Canvas2dDemo')}
      />
      <Button
        title="Rotate Remount to test Memory Leak"
        onPress={() => navigation.navigate('RotateRemount2MemoryLeak')}
      />
      <Button
        title="Draw Canvas to Canvas"
        onPress={() => navigation.navigate('DrawCanvas2Canvas')}
      />
      <Button
        title="Font Picker to fillText"
        onPress={() => navigation.navigate('FontPicker2FillText')}
      />
      <Button
        title="Zdog and Tests"
        onPress={() => navigation.navigate('ZdogAndTests')}
      />
      <Button
        title="Audio Frequency Histogram"
        onPress={() => navigation.navigate('AudioFrequencyHistogram')}
      />
      <Button
        title="Audio Wave Surfer"
        onPress={() => navigation.navigate('AudioWaveSurfer')}
      />
      <Button
        title="Webgl 3d Textures"
        onPress={() => navigation.navigate('Webgl3dTextures')}
      />
      <Button
        title="Webgl Cube Maps"
        onPress={() => navigation.navigate('WebglCubeMaps')}
      />
      <Button title="PixiJS" onPress={() => navigation.navigate('PixiJS')} />
      <Button
        title="babylonjs Drag and drop"
        onPress={() => navigation.navigate('DragNDrop')}
      />
      <Button
        title="babylonjs Non-Declarative"
        onPress={() => navigation.navigate('NonDeclarative')}
      />
      <Button
        title="Pixel Shape"
        onPress={() => navigation.navigate('PixelShape')}
      />
      <Button title="KonvaJS" onPress={() => navigation.navigate('KonvaJS')} />
    </View>
  );
}

const Stack = createNativeStackNavigator();

function App(): React.JSX.Element {
  return (
    <NavigationContainer>
      <StatusBar barStyle="dark-content" />
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{title: 'GCanvas React Native Examples'}}
        />
        <Stack.Screen
          name="Canvas2dDemo"
          component={Canvas2dDemoScreen}
          options={{title: 'Canvas 2d Demo'}}
        />
        <Stack.Screen
          name="RotateRemount2MemoryLeak"
          component={RotateRemount2MemoryLeakScreen}
          options={{title: 'Rotate Remount to test Memory Leak'}}
        />
        <Stack.Screen
          name="DrawCanvas2Canvas"
          component={DrawCanvas2CanvasScreen}
          options={{title: 'Draw Canvas to Canvas'}}
        />
        <Stack.Screen
          name="FontPicker2FillText"
          component={FontPicker2FillTextScreen}
          options={{title: 'Font Picker to fillText'}}
        />
        <Stack.Screen
          name="ZdogAndTests"
          component={ZdogAndTestsScreen}
          options={{title: 'Zdog and Tests'}}
        />
        <Stack.Screen
          name="AudioFrequencyHistogram"
          component={AudioFrequencyHistogramScreen}
          options={{title: 'Audio Frequency Histogram'}}
        />
        <Stack.Screen
          name="AudioWaveSurfer"
          component={AudioWaveSurferScreen}
          options={{title: 'Audio Wave Surfer'}}
        />
        <Stack.Screen
          name="Webgl3dTextures"
          component={Webgl3dTexturesScreen}
          options={{title: 'Webgl 3d Textures'}}
        />
        <Stack.Screen
          name="WebglCubeMaps"
          component={WebglCubeMapsScreen}
          options={{title: 'Webgl Cube Maps'}}
        />
        <Stack.Screen
          name="PixiJS"
          component={PixiScreen}
          options={{title: 'PixiJS'}}
        />
        <Stack.Screen
          name="DragNDrop"
          component={DragNDropScreen}
          options={{title: 'Drag and drop'}}
        />
        <Stack.Screen
          name="NonDeclarative"
          component={NonDeclarativeScreen}
          options={{title: 'Non-Declarative'}}
        />
        <Stack.Screen
          name="PixelShape"
          component={PixelShapeScreen}
          options={{title: 'Pixel Shape'}}
        />
        <Stack.Screen
          name="KonvaJS"
          component={KonvaScreen}
          options={{title: 'KonvaJS'}}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
