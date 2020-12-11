import React from 'react'

import './Input.css'

export const Input = ({ value, onChange, placeholder }) => {
  return (
    <input
      className="input"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
    />
  )
}
