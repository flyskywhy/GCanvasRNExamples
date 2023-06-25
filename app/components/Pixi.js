import React, {Component} from 'react';
import {PixelRatio, Platform, StyleSheet, View} from 'react-native';
import {GCanvasView} from '@flyskywhy/react-native-gcanvas';
import {Asset} from 'expo-asset';

import 'intl'; // pixi.js@7 need this

// for pixi.js@4.8.9
//     npm install --legacy-peer-deps pixi.js@4.8.9
// need 'pixi.js', and forceCanvas can be true or false
// import * as PIXI from 'pixi.js';

// for pixi.js@5 @6
//     npm install --legacy-peer-deps pixi.js@5 pixi.js-legacy@5
//     npm install --legacy-peer-deps pixi.js@6 pixi.js-legacy@6
// need 'pixi.js-legacy' cause demo here only support forceCanvas be true, TODO be false
import * as PIXI from 'pixi.js-legacy';

// you may need this line
// global.PIXI = global.PIXI || PIXI;

// you may need these 2 lines or not in pixi.js@4.8.9 (npm install --legacy-peer-deps pixi-filters@2.7.1)
// import * as filters from 'pixi-filters';
// PIXI.filters = {...(PIXI.filters || {}), ...filters};

// pixi.js@5 @6 pixiLoader.add() need this to avoid `ERROR    ReferenceError: Can't find variable: XMLDocument`
global.XMLDocument = global.XMLDocument || function () {};

// for game, 1 is more better than PixelRatio.get() to code with physical pixels
const devicePixelRatio = 1;

// PIXI default getContext 'webgl', or you can let it getContext '2d' instead against `forceCanvas = true`
const forceCanvas = true;

export default class Pixi extends Component {
  constructor(props) {
    super(props);
    this.canvas = null;
    this.app = null;
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
    // this.app.destroy(false, true);
    this.app.stop();
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
    // this.ctx = Platform.OS !== 'web' && this.canvas.getContext(forceCanvas ? '2d' : 'webgl');

    this.drawSome();
  };

  onCanvasResize = ({width, height, canvas}) => {
    // TODO: debug resize in pixi.js
    // canvas.width = width;
    // canvas.height = height;
    // this.drawSome();
  };

  drawSome = async () => {
    if (this.app) {
      return;
    }

    this.app = new PIXI.Application({
      // If Platform.OS === 'web', must use `view: this.canvas` instead of `context: this.ctx`.
      // If Platform.OS !== 'web', can just use `width: , height: `.
      view: Platform.OS === 'web' && this.canvas,
      forceCanvas,
      width: this.canvas.clientWidth * PixelRatio.get() / devicePixelRatio | 0,
      height: this.canvas.clientHeight * PixelRatio.get() / devicePixelRatio | 0,
      devicePixelRatio,
      backgroundColor: 0x7ed321,
    });

    const imageHttpSrc =
      'https://gw.alicdn.com/tfs/TB1KwRTlh6I8KJjy0FgXXXXzVXa-225-75.png';
    // `await Asset.fromModule` needs `expo-file-system`, and `expo-file-system` needs
    // `expo-modules` or old `react-native-unimodules`.
    // https://github.com/expo/expo/tree/sdk-47/packages/expo-asset said it needs
    // https://docs.expo.dev/bare/installing-expo-modules/ which also described how to
    // migrating from `react-native-unimodules`.
    // The installation of old `react-native-unimodules` can ref to this commit
    // [expo -> react-native: add react-native-unimodules]
    // (https://github.com/flyskywhy/snakeRN/commit/90983816de3ad2a4da47ffa0f6d1659c2688be3e).
    let imageRequireAsset = await Asset.fromModule(
      require('@flyskywhy/react-native-gcanvas/tools/build_website/assets/logo-gcanvas.png'),
    );
    let spriteHttpLoader;
    let spriteRequireLoader;

    const spriteByPixi7Assets = async () => {
      const gameLoop = (delta) => {
        if (spriteHttpLoader) {
          spriteHttpLoader.y -= 1;
        }
      };

      const textureRequire = await PIXI.loadTextures.load(imageRequireAsset.uri, {});
      spriteRequireLoader = new PIXI.Sprite(textureRequire);
      this.app.stage.addChild(spriteRequireLoader);
      spriteRequireLoader.x = 500;
      spriteRequireLoader.y = 700;

      this.app.ticker.add((delta) => gameLoop(delta));

      const textureHttp = await PIXI.loadTextures.load(imageHttpSrc, {});
      spriteHttpLoader = new PIXI.Sprite(textureHttp);
      this.app.stage.addChild(spriteHttpLoader);
      spriteHttpLoader.y = 700;
    };

    // pixi.js@4.8.9 need this
    // const pixiLoader = PIXI.loader;

    // pixi.js@5 @6 need this
    const {Loader} = PIXI;
    const pixiLoader = Loader && Loader.shared;

    const spriteByResourceLoader = () => {
      const gameLoop = (delta) => {
        if (spriteHttpLoader) {
          spriteHttpLoader.y -= 1;
        }
      };

      const setup = (loader, resources) => {
        spriteRequireLoader = new PIXI.Sprite(
          pixiLoader.resources[imageRequireAsset.uri].texture,
        );
        this.app.stage.addChild(spriteRequireLoader);

        spriteRequireLoader.x = 500;
        spriteRequireLoader.y = 700;

        spriteHttpLoader = new PIXI.Sprite(
          pixiLoader.resources[imageHttpSrc].texture,
        );

        this.app.stage.addChild(spriteHttpLoader);
        spriteHttpLoader.y = 700;

        this.app.ticker.add((delta) => gameLoop(delta));
      };

      // ref to [Pixi教程](https://github.com/Zainking/learningPixi)
      pixiLoader.resources[imageHttpSrc] || pixiLoader.add(imageHttpSrc);
      pixiLoader.resources[imageRequireAsset.uri] || pixiLoader
        .add({
          url: imageRequireAsset.uri,
          // imageRequireAsset must set loadType in this object when build release
          //
          // if 'node_modules/resource-loader' is which being depended on, then
          // loadType: require('resource-loader').Loader.Resource._loadTypeMap[imageRequireAsset.type],
          // if 'node_modules/pixi.js/node_modules/resource-loader' is which being depended on, then
          // loadType: require('pixi.js/node_modules/resource-loader').Loader.Resource._loadTypeMap[imageRequireAsset.type], // pixi.js@4.8.9 need this
          // if 'node_modules/@pixi/loaders' is which being depended on, then
          // loadType: require('@pixi/loaders').LoaderResource._loadTypeMap[imageRequireAsset.type], // pixi.js@5 @6 need this
        });
      pixiLoader.load(setup);
    };

    const spriteByNewImage = () => {
      const setup = (loader, resources) => {
        new PIXI.Texture.fromLoader(imageRequire, imageRequire.src);
        spriteRequireLoader = new PIXI.Sprite(
          PIXI.utils.TextureCache[imageRequireAsset.uri],
        );
        this.app.stage.addChild(spriteRequireLoader);

        spriteRequireLoader.x = 500;
        spriteRequireLoader.y = 700;
      };

      const imageRequire = new Image();
      imageRequire.onload = setup;
      imageRequire.src = imageRequireAsset.uri;
    };

    const spriteByFrom = async () => {
      spriteRequireLoader = PIXI.Sprite.from(imageRequireAsset.uri);
      this.app.stage.addChild(spriteRequireLoader);

      spriteRequireLoader.x = 500;
      spriteRequireLoader.y = 700;
    };

    // you can see how to use PIXI.Assets in it
    spriteByPixi7Assets(); // pixi.js@7 can use this

    // you can see how to use pixiLoader in it
    // spriteByResourceLoader(); pixi.js@4 @5 @6 can use this

    // or, use new Image() not pixiLoader in it
    // spriteByNewImage(); // pixi.js@4 @5 @6 @7 can use this

    // or, just use PIXI.Sprite.from() in it
    // spriteByFrom(); // pixi.js@4 @5 @6 @7 can use this
  };

  render() {
    return (
      <View style={styles.container}>
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
            style={styles.gcanvas}
            onCanvasResize={this.onCanvasResize}
            onCanvasCreate={this.initCanvas}
            devicePixelRatio={devicePixelRatio}
            offscreenCanvas={true} // so that can be document.createElement('canvas') in PIXI lib
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
});
