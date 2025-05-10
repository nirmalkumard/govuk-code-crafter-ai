
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './styles/govuk-custom.css' // Import the new CSS file

createRoot(document.getElementById("root")!).render(<App />);
