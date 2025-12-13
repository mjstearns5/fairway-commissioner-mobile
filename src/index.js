import React from 'react';
import './index.css';
import ReactDOM from 'react-dom/client';

// The import path now matches your new filename
// (Note: You don't need to type .jsx at the end, React figures it out)
import GolfTripCommissioner from './GolfTripCommissioner';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    {/* This tells React to render your Golf Commissioner component */}
    <GolfTripCommissioner />
  </React.StrictMode>
);