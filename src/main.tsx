import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
<<<<<<< HEAD

import { BrowserRouter } from 'react-router-dom'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
    <App />
    </BrowserRouter>
  </StrictMode>,
)
=======
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
>>>>>>> 459e939255c50018545216679ad44890a53ccdac
