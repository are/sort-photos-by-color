import React, { useCallback, useEffect, useState } from 'react'
import { Container, Header } from './components/Container'
import { Image } from './components/Image'
import { ImageGrid } from './components/ImageGrid'
import { Button } from './components/Button'

import FlipMove from 'react-flip-move'
import * as Vibrant from 'node-vibrant/dist/vibrant.worker'
import chroma from 'chroma-js'
import { Loader } from './components/Loader'

const CLIENT_ID = 'b082be41ba970bd'
const CLIENT_SECRET = 'e1c2324dd6b4bac3587b1a38d9879a2a6f5abff7'

const shuffle = (input) =>
  input
    .map((a) => ({ sort: Math.random(), value: a }))
    .sort((a, b) => a.sort - b.sort)
    .map((a) => a.value)

const initializeState = async (albumHash) => {
  const response = await fetch(
    `https://api.imgur.com/3/album/${albumHash}/images`,
    {
      headers: {
        Authorization: `Client-Id ${CLIENT_ID}`,
      },
    }
  )

  const album = await response.json()

  return await Promise.all(
    album.data
      .map((img) => img.link)
      .map((src) => {
        return Vibrant.from(src)
          .getPalette()
          .then((palette) => ({
            src: src,
            palette: palette,
            activeColor: 3,
          }))
      })
  )
}

const getActiveColor = (img) => Object.values(img.palette)[img.activeColor]

export const App = () => {
  const [isLoading, setLoading] = useState(false)
  const [state, setState] = useState([])

  useEffect(() => {
    setLoading(true)
    initializeState('SSUYPd5').then((newState) => {
      setState(newState)
      setLoading(false)
    })
  }, [])

  const setActive = useCallback(
    (imageIndex, index) => {
      setState((state) => {
        const newState = [...state]

        newState[imageIndex] = {
          ...state[imageIndex],
          activeColor: index,
        }

        return newState
      })
    },
    [setState]
  )

  const sortByColor = () => {
    setState((state) => {
      const newState = [...state]

      newState.sort((img1, img2) => {
        const color1 = chroma(getActiveColor(img1).getRgb())
        const color2 = chroma(getActiveColor(img2).getRgb())

        const result1 = chroma.deltaE(color1, '#FF0000', 0.5, 2)
        const result2 = chroma.deltaE(color2, '#FF0000', 0.5, 2)

        return result2 - result1
      })

      return newState
    })
  }

  return (
    <Container>
      <Header>
        <h1>Sort Images By Color</h1>
        <div>
          <Button onClick={() => setState(shuffle(state))}>Shuffle</Button>
          <Button onClick={() => sortByColor()}>Sort By Color</Button>
        </div>
      </Header>

      {isLoading ? <Loader /> : null}

      <ImageGrid>
        <FlipMove typeName={null} duration={1000} staggerDelayBy={50}>
          {state.map(({ src, palette, activeColor }, i) => (
            <Image
              src={src}
              key={src}
              palette={palette}
              activeColor={activeColor}
              setActive={(index) => setActive(i, index)}
            />
          ))}
        </FlipMove>
      </ImageGrid>
    </Container>
  )
}
