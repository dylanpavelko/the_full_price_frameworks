/**
 * Main App component for The Full Price
 * 
 * Sets up routing and the overall structure of the application.
 * All pages are connected through this central router.
 */
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Header } from './components/Header.jsx';
import { Home } from './pages/Home.jsx';
import { Products } from './pages/Products.jsx';
import { ProductDetail } from './pages/ProductDetail.jsx';
import { Posts } from './pages/Posts.jsx';
import { PostDetail } from './pages/PostDetail.jsx';
import './App.css';

export function App() {
  return (
    <Router>
      <Header />
      <main className="app-main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:slug" element={<ProductDetail />} />
          <Route path="/posts" element={<Posts />} />
          <Route path="/posts/:slug" element={<PostDetail />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </main>
      <Footer />
    </Router>
  );
}

/**
 * About page component
 */
function About() {
  return (
    <div className="about">
      <div className="about__container">
        <h1>About The Full Price</h1>
        <p>
          The Full Price is a project dedicated to helping consumers understand 
          the complete impact of their purchases—from production to disposal.
        </p>
        <h2>Our Mission</h2>
        <p>
          We believe that informed consumers make better choices. By providing 
          transparent, data-driven comparisons of product impacts, we empower 
          people to understand the true cost of the things they buy.
        </p>
        <h2>What We Track</h2>
        <ul>
          <li><strong>Financial Impact:</strong> Material and production costs</li>
          <li><strong>Climate Impact:</strong> Greenhouse gas emissions</li>
          <li><strong>Water Usage:</strong> Clean water requirements</li>
          <li><strong>Energy Required:</strong> Production and transportation energy</li>
          <li><strong>Land Needed:</strong> Land use for material sourcing</li>
        </ul>
      </div>
    </div>
  );
}

/**
 * Footer component
 */
function Footer() {
  return (
    <footer className="footer">
      <div className="footer__container">
        <p>&copy; 2024 The Full Price. All rights reserved.</p>
        <p>Built with transparency and open data.</p>
      </div>
    </footer>
  );
}
