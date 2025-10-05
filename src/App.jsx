import React from 'react';
import { ProvedorAutenticacao } from './contextos/ContextoAutenticacao';
import RotasApp from './rotas';

function App() {
  return (
    <ProvedorAutenticacao>
      <RotasApp />
    </ProvedorAutenticacao>
  );
}

export default App;
