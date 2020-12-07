import React, { forwardRef, useEffect, useState } from 'react'

import * as Vibrant from 'node-vibrant/dist/vibrant.worker'

import {
  image,
  imageContainer,
  colorBox,
  colorBoxContainer,
  activeBox,
} from './Image.css'

const toStringColor = ([r, g, b]) => `rgb(${r}, ${g}, ${b})`

export const Image = forwardRef(
  ({ src, palette, activeColor, setActive }, ref) => {
    return (
      <div className={imageContainer} ref={ref}>
        <img className={image} src={src} />
        <div className={colorBoxContainer}>
          {Object.values(palette).map((color, i) => (
            <div
              key={color.getRgb()}
              className={`${colorBox} ${i === activeColor ? activeBox : ''}`}
              style={{ backgroundColor: toStringColor(color.getRgb()) }}
              onClick={() => setActive(i)}
            ></div>
          ))}
        </div>
      </div>
    )
  }
)
