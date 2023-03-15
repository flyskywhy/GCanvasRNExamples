import React, {Component} from 'react';
import {Platform, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {GCanvasView, getFontNames} from '@flyskywhy/react-native-gcanvas';
import FontPicker from 'react-native-font-picker';

export default class FontPicker2FillText extends Component {
  constructor(props) {
    super(props);
    this.fontNames = getFontNames();
    this.canvas = null;
    this.state = {
      debugInfo: 'Click me to draw some on canvas',
      fontName: 'arial',
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
    if (this.ctx) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.fillStyle = 'red';
      this.ctx.fillRect(0, 0, 288, 192);

      this.ctx.fillStyle = 'yellow';

      this.ctx.font = `30px ${this.state.fontName}`;
      this.ctx.fillText('@  flyskywhy/', 10, 50);
      this.ctx.fillText('react-', 37, 85);
      this.ctx.fillText('native-', 23, 120);
      this.ctx.fillText('gcanvas', 7, 155);
    }
  };

  render() {
    const {fontName} = this.state;

    return (
      <View style={styles.container}>
        <TouchableOpacity onPress={this.drawSome}>
          <Text style={styles.welcome}>{this.state.debugInfo}</Text>
        </TouchableOpacity>
        <View
          style={{
            width: 200,
            height: 70,
          }}
        >
          <FontPicker
            fieldPlaceholderText={'FONT'}
            fieldIndiText={'FONT: '}
            styleFieldContainer={{
              padding: 10,
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
            }}
            styleFieldPlaceholderText={{color: '#4489FF'}}
            styleFieldIndiText={{color: '#4489FF'}}
            styleFieldFontText={[
              {color: 'red'},
              fontName && {fontFamily: fontName},
            ]}
            fonts={this.fontNames}
            previews={true}
            styleModalContainer={{width: 200, height: 300}}
            styleOptionContainer={{backgroundColor: 'grey'}}
            styleOptionFontText={{color: 'white'}}
            styleOptionActiveContainer={{backgroundColor: 'white'}}
            styleOptionActiveFontText={{color: 'grey'}}
            value={fontName}
            onChange={value => this.setState({fontName: value})}
          />
        </View>
        {Platform.OS === 'web' ? (
          <canvas
            id={'canvasExample'}
            ref={this.initCanvas}
            style={
              {
                flex: 1,
                width: '100%',
              } /* canvas with react-native-web can't use width and height in styles.gcanvas */
            }
          />
        ) : (
          <GCanvasView
            onCanvasResize={this.onCanvasResize}
            onCanvasCreate={this.initCanvas}
            isGestureResponsible={false}
            style={styles.gcanvas}
          />
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
    flex: 1,
    width: '100%',
    // backgroundColor: '#FF000030', // TextureView doesn't support displaying a background drawable since Android API 24
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    marginVertical: 20,
  },
});
