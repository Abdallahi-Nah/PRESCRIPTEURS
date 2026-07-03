import React from 'react';
import PrescripteurList from './pages/PrescripteurList';
import Header from './components/Header';

function App() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans transition-colors duration-200">
      <Header />
      <main className="flex-1">
        <PrescripteurList />
      </main>
    </div>
  );
}

export default App;
