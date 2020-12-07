import React from 'react'

import './Container.css'

export const Container = ({ children }) => {
  return <div className="container">{children}</div>
}

export const Header = ({ children }) => {
  return <div className="header">{children}</div>
}
