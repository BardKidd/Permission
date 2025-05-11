import { Routes, Route, Link } from 'react-router-dom';
import About from './pages/About';
import Unauthorized from './pages/Unauthorized';
import { PermissionLink } from './components/PermissionLink';

export default function AppRoutes() {
  return (
    <>
      <nav>
        <PermissionLink to="/" subject="Home">
          Home
        </PermissionLink>
        <PermissionLink to="/about" subject="About">
          About
        </PermissionLink>
      </nav>

      <Routes>
        <Route path="/" element={<h1>Home Page</h1>} />
        <Route path="/about" element={<About />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
      </Routes>
    </>
  );
}
