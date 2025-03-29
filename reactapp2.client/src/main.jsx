import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './main.css'
import App from './App.jsx'
import FileUpload from './FileUpload.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
        {/*<App />*/}
        <div className="FileUpload">
            <FileUpload />
        </div>
  </StrictMode>,
)
