import React from 'react';
import CharacterTable from './components/CharacterTable';

const App: React.FC = () => {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Star Wars Characters</h1>
      </header>
      <main>
        <CharacterTable />
      </main>
    </div>
  );
};

export default App;