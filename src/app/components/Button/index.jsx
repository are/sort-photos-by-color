import React from 'react'

import { button } from './Button.css'

export const Button = ({ children, onClick }) => {
  return (
    <button className={button} onClick={onClick}>
      {children}
    </button>
  )
}
