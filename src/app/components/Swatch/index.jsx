import React from 'react'

import './Swatch.css'

export const Swatch = ({ children, color, onClick, active, value }) => {
  return (
    <div className="swatch-container">
      <div className="swatch-label">{children}</div>
      <button
        className={`swatch ${active ? 'active' : ''}`}
        style={{ backgroundColor: color ?? 'unset' }}
        onClick={onClick}
      >
        {value}
      </button>
    </div>
  )
}
