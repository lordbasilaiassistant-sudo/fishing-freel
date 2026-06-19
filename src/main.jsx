import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// No StrictMode: it double-invokes effects, which double-initializes the
// imperative three.js Water/Reflector objects we mount via <primitive>.
createRoot(document.getElementById('root')).render(<App />)
