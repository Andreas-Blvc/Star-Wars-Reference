import React from 'react';
import CharacterOverview from './components/CharacterOverview';

const App: React.FC = () => {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Star Wars Characters</h1>
      </header>
      <main>
        <CharacterOverview pageSize={16} />
      </main>
    </div>
  );
};

export default App;