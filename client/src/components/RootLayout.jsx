import { Link } from 'react-router';
import { Outlet } from 'react-router';

function RootLayout() {
  return (
    <>
      <div>Layout with Nav Bar</div>
      <nav>
        <Link to='/'>Home</Link>
        <span> </span>
        <Link to='/other'>Other Page</Link>
      </nav>
      <Outlet />
    </>
  );
}

export default RootLayout;
