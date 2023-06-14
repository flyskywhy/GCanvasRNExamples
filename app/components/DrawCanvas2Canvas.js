import React, {Component} from 'react';
import {Platform, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {GCanvasView} from '@flyskywhy/react-native-gcanvas';

export default class DrawCanvas2Canvas extends Component {
  constructor(props) {
    super(props);
    this.canvas = null;
    this.state = {
      debugInfo: 'Click me to draw some on canvas',
      hasOc1: false,
    };
  }

  componentDidMount() {
    if (Platform.OS === 'web') {
      const resizeObserver = new ResizeObserver(entries => {
        for (let entry of entries) {
          if (entry.target.id === 'canvasExample') {
            let {width, height} = entry.contentRect;
            this.onCanvasResize({width, height, canvas: entry.target});
          }
        }
      });
      resizeObserver.observe(document.getElementById('canvasExample'));
    }
  }

  initCanvas = canvas => {
    if (this.canvas) {
      return;
    }

    this.canvas = canvas;
    if (Platform.OS === 'web') {
      // canvas.width not equal canvas.clientWidth but "Defaults to 300" ref
      // to https://developer.mozilla.org/en-US/docs/Web/HTML/Element/canvas,
      // so have to assign again, unless <canvas width=SOME_NUMBER/> in render()
      this.canvas.width = this.canvas.clientWidth;
      this.canvas.height = this.canvas.clientHeight;
    }
    // should not name this.context because this.context is already be {} here and will
    // be {} again after componentDidUpdate() on react-native or react-native-web, so
    // name this.ctx
    this.ctx = this.canvas.getContext('2d');
  };

  onCanvasResize = ({width, height, canvas}) => {
    canvas.width = width;
    canvas.height = height;
    this.drawSome();
  };

  drawSome = async () => {
    const offscreenCanvas = document.createElement('canvas');
    const offscreenCanvasCtx = offscreenCanvas.getContext('2d');
    offscreenCanvasCtx.fillStyle = 'red';
    offscreenCanvasCtx.fillRect(0, 0, 1000, 1000);

    this.ctx.drawImage(offscreenCanvas, 0, 0, 100, 100, 0, 0, 100, 100);

    // if ctx.drawImage(offscreenCanvas) is not follow by some ctx.some(),
    // will cause image not display on screen #59, so just ctx.some() here.
    this.ctx.fillStyle = '#19491001';
  };

  render() {
    return (
      <View style={styles.container}>
        {Platform.OS !== 'web' && (
          <GCanvasView
            style={{
              width: 1000, // 1000 should enough for offscreen canvas usage
              height: 1000,
              position: 'absolute',
              left: 1000, // 1000 should enough to not display on screen means offscreen canvas :P
              top: 0,
              zIndex: -100, // -100 should enough to not bother onscreen canvas
            }}
            offscreenCanvas={true}
            onCanvasCreate={canvas => {
              this.setState({hasOc1: true});
            }}
            devicePixelRatio={1} // should not 1 < devicePixelRatio < 2 as float to avoid pixel offset flaw when GetImageData with PixelsSampler in @flyskywhy/react-native-gcanvas/core/src/support/GLUtil.cpp
            isGestureResponsible={false}
          />
        )}
        <TouchableOpacity onPress={this.drawSome}>
          <Text style={styles.welcome}>{this.state.debugInfo}</Text>
        </TouchableOpacity>
        {Platform.OS === 'web' ? (
          <canvas
            id={'canvasExample'}
            ref={this.initCanvas}
            style={
              {
                flex: 1,
                width: '100%',
                //
                // width: 200,
                // height: 300,
              } /* canvas with react-native-web can't use width and height in styles.gcanvas */
            }
          />
        ) : (
          this.state.hasOc1 && (
            <GCanvasView
              onCanvasResize={this.onCanvasResize}
              onCanvasCreate={this.initCanvas}
              style={styles.gcanvas}
            />
          )
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
  gcanvas: {
    // flex: 1,
    // width: '100%',
    // above maybe will not work,
    // so use below
    width: 200,
    height: 300,

    // backgroundColor: '#FF000030', // TextureView doesn't support displaying a background drawable since Android API 24
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    marginVertical: 20,
  },
});
