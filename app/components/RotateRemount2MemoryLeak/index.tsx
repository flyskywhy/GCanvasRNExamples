// ref to https://github.com/Loovery/gcanvas-memory-leak

import React, {useEffect, useState} from 'react'
import {
  SafeAreaView,
  View,
  Dimensions
} from 'react-native'
import Landscape from './Landscape'
import Portrait from './Portrait'

const App = () => {
  const [isLandscape, setOrientation] = useState(false)

  useEffect(() => {
    const onChange = ({ window: { width, height } }) => {
      console.log('change', width > height)
      setOrientation(width > height)
    };

    const change = Dimensions.addEventListener('change', onChange)
    return () => {
      change.remove()
    };
  }, []);

  return (
    <SafeAreaView style={{flex: 1}}>
      <View style={{flex: 1, width: '100%', position: 'relative'}}>
        {isLandscape ? <Landscape isLandscape={isLandscape} /> : <Portrait isLandscape={isLandscape} />}
      </View>
    </SafeAreaView>
  )
}

export default App
