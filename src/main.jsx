import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from '#app';
import BodyScrollbars from './shared/BodyScrollbars.jsx';
import './shared/fonts.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
    <BodyScrollbars />
  </StrictMode>,
);
