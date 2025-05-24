
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './styles/govuk-custom.css'
import 'govuk-frontend/govuk/all.scss' // Import GOV.UK Frontend styles

createRoot(document.getElementById("root")!).render(<App />);
