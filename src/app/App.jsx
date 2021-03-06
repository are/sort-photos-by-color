import React, { useCallback, useEffect, useState } from 'react'
import { Container, Header } from './components/Container'
import { Image } from './components/Image'
import { ImageGrid } from './components/ImageGrid'
import { Button } from './components/Button'
import { Swatch } from './components/Swatch'

import FlipMove from 'react-flip-move'
import * as Vibrant from 'node-vibrant/dist/vibrant.worker'
import chroma from 'chroma-js'
import { Loader } from './components/Loader'
import { Input } from './components/Input'

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
      .map((img) => `https://i.imgur.com/${img.id}m.jpg`)
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
  const [inputText, setInputText] = useState('')
  const [isChoosingRef, setChoosingRef] = useState(false)
  const [refColor, setRefColor] = useState('#FF0000')
  const [albumId, setAlbumId] = useState(null)
  const [isLoading, setLoading] = useState(false)
  const [state, setState] = useState([])
  const [reverseSort, setReverseSort] = useState(false)

  useEffect(() => {
    if (albumId !== null) {
      setLoading(true)
      initializeState(albumId).then((newState) => {
        setState(newState)
        setLoading(false)
      })
    }
  }, [albumId])

  const setActive = useCallback(
    (imageIndex, index) => {
      if (isChoosingRef) {
        const color = Object.values(state[imageIndex].palette)[index]

        const [r, g, b] = color.getRgb()

        setChoosingRef(false)
        setRefColor(`rgb(${r.toFixed(0)}, ${g.toFixed(0)}, ${b.toFixed(0)})`)

        return
      }

      setState((state) => {
        const newState = [...state]

        newState[imageIndex] = {
          ...state[imageIndex],
          activeColor: index,
        }

        return newState
      })
    },
    [state, setState, isChoosingRef]
  )

  const setRef = useCallback(() => {
    setChoosingRef((value) => !value)
  }, [setChoosingRef])

  if (albumId === null) {
    return (
      <Container>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Input
            placeholder="Imgur Album ID"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
          <Button
            onClick={() => {
              if (inputText.trim() !== '') {
                setAlbumId(inputText)
              }
            }}
          >
            Get the album
          </Button>
        </div>
      </Container>
    )
  }

  const sortByColor = () => {
    setState((state) => {
      const newState = [...state]

      newState.sort((img1, img2) => {
        const color1 = chroma(getActiveColor(img1).getRgb())
        const color2 = chroma(getActiveColor(img2).getRgb())

        const result1 = chroma.deltaE(color1, refColor, 0.5, 2)
        const result2 = chroma.deltaE(color2, refColor, 0.5, 2)

        return reverseSort ? result1 - result2 : result2 - result1
      })

      return newState
    })
  }

  return (
    <Container>
      <Header>
        <h1>Sort Images By Color</h1>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div>
            <Button onClick={() => setState(shuffle(state))}>Shuffle</Button>
            <Button onClick={() => sortByColor()}>Sort By Color</Button>
          </div>

          <Swatch color={refColor} onClick={setRef} active={isChoosingRef}>
            Reference color:
          </Swatch>
          <Swatch
            onClick={() => setReverseSort((value) => !value)}
            value={reverseSort ? '<' : '>'}
          >
            Order:
          </Swatch>
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
