import {GCanvasView} from '@flyskywhy/react-native-gcanvas'
import React, {useCallback} from 'react'

const Test = ({isLandscape}) => {
  const initCanvas = useCallback((canvas) => {
    const context = canvas.getContext('2d')

    context.fillStyle = isLandscape ? '#aaa' : '#222'
    context.fillRect(0, 0, canvas.width, canvas.height)

    context.font = `18px`
    context.textAlign = 'center'
    context.textBaseline = 'middle'
    context.fillStyle = isLandscape ? '#222' : '#aaa'

    context.fillText(isLandscape ? 'Landscape' : 'Portrait', 50, 150)
  }, [isLandscape])

  return <GCanvasView
    style={{flex: 1, width: '100%'}}
    isGestureResponsible={false}
    onCanvasCreate={initCanvas}
  />
}

export default Test
