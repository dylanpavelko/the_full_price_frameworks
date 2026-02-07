/**
 * Header component for The Full Price website
 * 
 * Displays the main navigation and site branding.
 * This is shown on every page of the application.
 */
import { Link } from 'react-router-dom';
import './Header.css';

export function Header() {
  return (
    <header className="header">
      <div className="header__container">
        <Link to="/" className="header__logo">
          <img src="/logo.svg" alt="The Full Price Logo" className="header__logo-icon" />
          <div className="header__logo-text">
            <h1>theFullPrice.com</h1>
            <p className="header__tagline">Understanding the 360° Impact of Your Purchases</p>
          </div>
        </Link>
        
        <nav className="header__nav">
          <Link to="/" className="header__link">Home</Link>
          <Link to="/products" className="header__link">Explore Products</Link>
          <Link to="/posts" className="header__link">Blog</Link>
          <Link to="/about" className="header__link">About</Link>
        </nav>
      </div>
    </header>
  );
}
