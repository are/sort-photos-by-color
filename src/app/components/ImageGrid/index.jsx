import React from 'react'

import { grid } from './ImageGrid.css'

export const ImageGrid = ({ children }) => {
  return <div className={grid}>{children}</div>
}
