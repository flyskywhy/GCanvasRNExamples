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
  FrequencyHistogramView,
} from 'react-native-live-audio-fft';

const optionsOfLiveAudioStream = {
  sampleRate: 32000,  // default is 44100 but 32000 is adequate for accurate voice recognition, maybe even music
  channels: 1,        // 1 or 2, default 1
  bitsPerSample: 16,  // 8 or 16, default 16
  audioSource: 1,     // android only, 1 for music, 6 for voice recognition, default is 6
  bufferSize: 4096    // default is 2048
};

const histogramSetScale = 1; // if is not 1, e.g. PixelRatio.get(), you should define devicePixelRatio of <GCanvasView/> (see below)

export default class AudioFrequencyHistogram extends Component {
  constructor(props) {
    super(props);
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

    const histogramSet = {
      canvas: this.canvas,
      ctx: this.ctx,
      // width, // if canvas is not defined, at least must define width and height
      // height, // if canvas is defined, it is allowed to not define width and height
      // scale: histogramSetScale, // if histogramSetScale is 1, you can remove this line because default is 1
      asyncFftAtFps: true, // if you want draw on every onAudioPcmData(), you should set it to false
      lineCount: 20,
      minHeight: 1,
      stripeEnable: false,
    };
    this.histogram = FrequencyHistogramView(histogramSet);
  };

  onCanvasResize = ({width, height, canvas}) => {
    canvas.width = width;
    canvas.height = height;

    this.histogram.set.width = width;
    this.histogram.set.height = height;
  };

  onAudioPcmData = pcmDataBase64 => {
    const {pcmData, sum} = NativeRecordReceivePCM(pcmDataBase64);
    // const powerLevel = PowerLevel(sum, pcmData.length);

    // ref to envIn() in
    // https://github.com/xiangyuecn/Recorder/blob/master/src/recorder-core.js
    // ref to onProcess() in
    // https://github.com/xiangyuecn/Recorder/blob/master/app-support-sample/index.html
    // ref to FrequencyHistogramView.input() in
    // https://github.com/xiangyuecn/Recorder/blob/1.2.23070100/src/extensions/frequency.histogram.view.js
    const frequencyData = this.histogram.input(
      pcmData,
      0 /* powerLevel, useless in histogram */,
      optionsOfLiveAudioStream.sampleRate,
    );

    if (this.histogram.set.asyncFftAtFps === false) {
      if (this.histogram.set.canvas) {
        // draw() will invoke frequencyData2H() automatically then draw
        // on this.histogram.set.canvas
        this.histogram.draw(frequencyData, optionsOfLiveAudioStream.sampleRate);
      } else if (this.histogram.set.width && this.histogram.set.height) {
        const {lastH} = this.histogram.frequencyData2H({
          frequencyData,
          sampleRate: config.liveAudioStream.sampleRate,
        });
        // then your custom canvas or other usecase can use lastH which
        // is an array of height (max is this.histogram.set.height) on every
        // (count is this.histogram.set.lineCount) frequency
        // ...
      }
    }
  };

  startAudioRecoder = async () => {
    const status = await request(
      Platform.select({
        android: PERMISSIONS.ANDROID.RECORD_AUDIO,
        ios: PERMISSIONS.IOS.MICROPHONE,
      }),
    );
    if (status === 'granted') {
      LiveAudioStream.stop();
      LiveAudioStream.init(optionsOfLiveAudioStream);
      LiveAudioStream.start();
    }
  };

  stopAudioRecoder = () => {
    LiveAudioStream.stop();
  };

  render() {
    return (
      <View style={styles.container}>
        <TouchableOpacity onPress={this.startAudioRecoder}>
          <Text style={styles.welcome}>Start audio recoder</Text>
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
          <GCanvasView
            onCanvasResize={this.onCanvasResize}
            onCanvasCreate={this.initCanvas}
            isGestureResponsible={false}
            // devicePixelRatio={PixelRatio.get() / histogramSetScale /* if histogramSetScale is 1, you can remove this line because default is PixelRatio.get() */}
            style={styles.gcanvas}
          />
        )}
        <TouchableOpacity onPress={this.stopAudioRecoder}>
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
    // width: 200,
    // height: 300,

    // backgroundColor: '#FF000030', // TextureView doesn't support displaying a background drawable since Android API 24
  },
  welcome: {
    color: 'black',
    fontSize: 20,
    textAlign: 'center',
    marginVertical: 20,
  },
});
