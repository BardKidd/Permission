import { useState } from 'react';
import { AbilityContext } from './contexts';
import defineAbilityFor from './utility/defineAbilityFor';
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes';

function App() {
  const [userPermissions] = useState([
    { subject: 'Home', level: 'write' },
    { subject: 'About', level: 'read' },
  ]);
  return (
    <BrowserRouter>
      <AbilityContext.Provider value={defineAbilityFor(userPermissions)}>
        <AppRoutes />
      </AbilityContext.Provider>
    </BrowserRouter>
  );
}

export default App;
