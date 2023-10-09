import React from 'react'
import { createRoot } from 'react-dom/client'
import './style.css'
import App from './App'

// main.ts
import '@unocss/reset/tailwind.css'
import 'virtual:uno.css'

const container = document.getElementById('root')

const root = createRoot(container!)

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
