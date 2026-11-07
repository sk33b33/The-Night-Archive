import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './app/App';
import { UpdatePrompt } from './app/UpdatePrompt';
import './styles/tokens.css';
import './styles/global.css';

const container = document.getElementById('root');
if (!container) throw new Error('Root element #root is missing from index.html.');

createRoot(container).render(
  <StrictMode>
    <App />
    <UpdatePrompt />
  </StrictMode>,
);
