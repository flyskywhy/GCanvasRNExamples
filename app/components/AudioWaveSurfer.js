import React, {Component} from 'react';
import {
  PixelRatio,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {GCanvasView} from '@flyskywhy/react-native-gcanvas';
if (Platform.OS !== 'web') {
  var {PERMISSIONS, request} = require('react-native-permissions').default;
}
import LiveAudioStream, {
  PowerLevel,
  NativeRecordReceivePCM,
  WaveSurferView,
} from 'react-native-live-audio-fft';

const optionsOfLiveAudioStream = {
  sampleRate: 32000,  // default is 44100 but 32000 is adequate for accurate voice recognition, maybe even music
  channels: 1,        // 1 or 2, default 1
  bitsPerSample: 16,  // 8 or 16, default 16
  audioSource: 1,     // android only, 1 for music, 6 for voice recognition, default is 6
  bufferSize: 4096    // default is 2048
};

const waveSurferWidth = 300;
const waveSurferHeight = 100;

export default class AudioWaveSurfer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasOc1: false,
    };
    this.canvas = null;
    LiveAudioStream.on('data', this.onAudioPcmData);
  }

  componentDidMount() {
    if (Platform.OS === 'web') {
      const resizeObserver = new ResizeObserver((entries) => {
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

  componentWillUnmount() {
    this.stopAudioRecorder();
  }

  initCanvas = (canvas) => {
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

    const offscreenCanvas = document.createElement('canvas');
    const offscreenCanvasCtx = offscreenCanvas.getContext('2d');

    const waveSurferSet = {
      canvas: this.canvas,
      ctx: this.ctx,
      canvas2: offscreenCanvas,
      ctx2: offscreenCanvasCtx,
      fps: 10, // refresh speed, will stuck if too high with https://github.com/flyskywhy/react-native-gcanvas
      duration: 2000, // move speed, smaller is faster
    };
    this.waveSurfer = WaveSurferView(waveSurferSet);
  };

  onCanvasResize = ({width, height, canvas}) => {
    canvas.width = width;
    canvas.height = height;

    this.waveSurfer.set.width = width;
    this.waveSurfer.set.height = height;
  };

  onAudioPcmData = pcmDataBase64 => {
    const {pcmData, sum} = NativeRecordReceivePCM(pcmDataBase64);
    // const powerLevel = PowerLevel(sum, pcmData.length);

    // ref to envIn() in
    // https://github.com/xiangyuecn/Recorder/blob/master/src/recorder-core.js
    // ref to onProcess() in
    // https://github.com/xiangyuecn/Recorder/blob/master/app-support-sample/index.html
    // ref to WaveSurferView.input() in
    // https://github.com/xiangyuecn/Recorder/blob/1.2.23070100/src/extensions/wavesurfer.view.js
    this.waveSurfer.input(
      pcmData,
      0 /* powerLevel, useless in waveSurfer */,
      optionsOfLiveAudioStream.sampleRate,
    );
  };

  startAudioRecoder = async () => {
    const status = await request(
      Platform.select({
        android: PERMISSIONS.ANDROID.RECORD_AUDIO,
        ios: PERMISSIONS.IOS.MICROPHONE, // actually, it's not necessary to request MICROPHONE on iOS
      }),
    );
    if (status === 'granted') {
      LiveAudioStream.stop();
      LiveAudioStream.init(optionsOfLiveAudioStream);
      LiveAudioStream.start();
    }
  };

  stopAudioRecorder = () => {
    LiveAudioStream.stop();
  };

  render() {
    return (
      <View style={styles.container}>
        {Platform.OS !== 'web' && (
          <GCanvasView
            style={{
              width: waveSurferWidth * 2,
              height: waveSurferHeight,
              position: 'absolute',
              left: 1000, // 1000 should enough to not display on screen means offscreen canvas :P
              top: 0,
              zIndex: -100, // -100 should enough to not bother onscreen canvas
            }}
            offscreenCanvas={true}
            onCanvasCreate={canvas => {
              this.setState({hasOc1: true});
            }}
            isGestureResponsible={false}
          />
        )}
        <TouchableOpacity onPress={this.startAudioRecoder}>
          <Text style={styles.welcome}>Start audio recoder</Text>
        </TouchableOpacity>
        <View style={{width: waveSurferWidth, height: waveSurferHeight, backgroundColor: '#FF000030'}}>
          {Platform.OS === 'web' ? (
            <canvas
              id={'canvasExample'}
              ref={this.initCanvas}
              style={
                {
                  flex: 1,
                  width: '100%',
                  //
                  // width: waveSurferWidth,
                  // height: waveSurferHeight,
                } /* canvas with react-native-web can't use width and height in styles.gcanvas */
              }
            />
          ) : (
            this.state.hasOc1 && (
              <GCanvasView
                onCanvasResize={this.onCanvasResize}
                onCanvasCreate={this.initCanvas}
                isGestureResponsible={false}
                style={styles.gcanvas}
              />
            )
          )}
        </View>
        <TouchableOpacity onPress={this.stopAudioRecorder}>
          <Text style={styles.welcome}>Stop audio recoder</Text>
        </TouchableOpacity>
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
    // above maybe will cause
    //     WARN     getImageData: not good to be here, should refactor source code somewhere
    // if let this component as a children of another component,
    // you can use below
    // width: waveSurferWidth,
    // height: waveSurferHeight,

    // backgroundColor: '#FF000030', // TextureView doesn't support displaying a background drawable since Android API 24
  },
  welcome: {
    color: 'black',
    fontSize: 20,
    textAlign: 'center',
    marginVertical: 20,
  },
});
