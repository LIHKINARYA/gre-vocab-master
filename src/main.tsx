import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Analytics } from '@vercel/analytics/react'
import { initGoogleAnalytics } from './core/analytics/googleAnalytics'
import './index.css'
import App from './App.tsx'

// Safely initializes GA4 if VITE_GA_MEASUREMENT_ID is configured
initGoogleAnalytics()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    <Analytics />
  </StrictMode>,
)
