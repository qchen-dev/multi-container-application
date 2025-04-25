import React from 'react';
import { Link } from 'react-router';

function Other() {
  return (
    <div>
      <h1>I am the other page</h1>
      <Link to='/'>Back Home Page</Link>
    </div>
  );
}

export default Other;
