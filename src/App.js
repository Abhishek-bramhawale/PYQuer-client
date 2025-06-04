import React from 'react';
import './App.css';
import Navbar from './components/Navbar';
import FileUpload from './components/FileUpload';

function App() {
  return (
    <div className="App">
      <Navbar />
      <main className="main-content">
        <FileUpload />
      </main>
    </div>
  );
}

export default App;
