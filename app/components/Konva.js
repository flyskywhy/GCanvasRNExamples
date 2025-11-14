import React, {Component} from 'react';
import {Platform, StyleSheet, View} from 'react-native';
import {GCanvasView} from '@flyskywhy/react-native-gcanvas';
import {Stage, Layer, Rect, Text} from 'react-konva';
import KONVA from 'konva';

export default class Konva extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasOc1: false,
      hasOc2: false,
      color: 'green',
    };
  }

  handleClick = () => {
    this.setState({color: KONVA.Util.getRandomColor()});
  };

  render() {
    const {color, hasOc1, hasOc2} = this.state;
    const isOffscreenCanvasReady = Platform.OS === 'web' || (hasOc1 && hasOc2);

    return (
      <View style={styles.container}>
        {Platform.OS !== 'web' && (
          <GCanvasView
            style={{
              width: 300, // 1000 should enough for offscreen canvas usage
              height: 300,
              position: 'absolute',
              left: 0, // 1000 should enough to not display on screen means offscreen canvas :P
              top: 0,
              zIndex: -1, // -100 should enough to not bother onscreen canvas
            }}
            offscreenCanvas={true}
            onCanvasCreate={canvas => {
              this.setState({hasOc1: true});
            }}
            devicePixelRatio={1} // should not 1 < devicePixelRatio < 2 as float to avoid pixel offset flaw when GetImageData with PixelsSampler in @flyskywhy/react-native-gcanvas/core/src/support/GLUtil.cpp
            // isGestureResponsible={false}
          />
        )}
        {Platform.OS !== 'web' && (
          <GCanvasView
            style={{
              width: 300, // 1000 should enough for offscreen canvas usage
              height: 300,
              position: 'absolute',
              left: 0, // 1000 should enough to not display on screen means offscreen canvas :P
              top: 0,
              // zIndex: -100, // -100 should enough to not bother onscreen canvas
            }}
            offscreenCanvas={true}
            onCanvasCreate={canvas => {
              this.setState({hasOc2: true});
            }}
            devicePixelRatio={1} // should not 1 < devicePixelRatio < 2 as float to avoid pixel offset flaw when GetImageData with PixelsSampler in @flyskywhy/react-native-gcanvas/core/src/support/GLUtil.cpp
            // isGestureResponsible={false}
          />
        )}
        {isOffscreenCanvasReady && (
          <Stage width={300} height={300}>
            <Layer>
              <Text text="Try click on rect" />
              <Rect
                x={200}
                y={200}
                width={50}
                height={50}
                fill={color}
                shadowBlur={5}
                onPointerMove={this.handleClick}
              />
            </Layer>
          </Stage>
        )}
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
