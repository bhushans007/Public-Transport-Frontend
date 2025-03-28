import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { RootRouter } from './routes/routeRouter';
// import QrScanner from './QrScanner';

function App() {
  return (
    <BrowserRouter>
      <RootRouter />
    </BrowserRouter>
  );
}

export default App;