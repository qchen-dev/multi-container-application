import React from 'react';
import { Link } from 'react-router';
import Fib from './Fib';
import './App.css';

function App() {
  return (
    <>
      <Link to='other'>Go to other page</Link>
      <Fib />

      <p className='read-the-docs'>
        This is Fib Calculator
      </p>
    </>
  );
}

export default App;
