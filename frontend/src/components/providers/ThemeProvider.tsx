import React from 'react'

interface ThemeProviderProps {
  children: React.ReactNode
}

const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  return <>{children}</>
}

export default ThemeProvider