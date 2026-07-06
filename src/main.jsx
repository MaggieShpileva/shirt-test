import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { preloadMaterialPreviews } from './config/preloadMaterials.js'
import './index.css'

preloadMaterialPreviews()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
