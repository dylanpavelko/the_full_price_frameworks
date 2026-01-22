/**
 * Home page for The Full Price
 * 
 * Welcome page that explains the project and directs users to
 * products and blog content.
 */
import { Link } from 'react-router-dom';
import './Home.css';

export function Home() {
  return (
    <div className="home">
      <section className="hero">
        <div className="hero__content">
          <h1>Understand the True Cost of Your Purchases</h1>
          <p>
            Every product you buy has a hidden cost—to your finances, the environment, 
            and natural resources. The Full Price helps you see the complete picture.
          </p>
          <div className="hero__cta">
            <Link to="/products" className="cta-button">
              Explore Products
            </Link>
            <Link to="/posts" className="cta-button cta-button--secondary">
              Read Our Blog
            </Link>
          </div>
        </div>
      </section>

      <section className="features">
        <div className="features__container">
          <div className="feature">
            <div className="feature__icon">💰</div>
            <h3>Financial Impact</h3>
            <p>Understanding the true cost of materials and their production</p>
          </div>

          <div className="feature">
            <div className="feature__icon">🌍</div>
            <h3>Climate Impact</h3>
            <p>See the greenhouse gas emissions from production to disposal</p>
          </div>

          <div className="feature">
            <div className="feature__icon">💧</div>
            <h3>Water Usage</h3>
            <p>Learn how much clean water each product requires</p>
          </div>

          <div className="feature">
            <div className="feature__icon">⚡</div>
            <h3>Energy Required</h3>
            <p>Discover the energy footprint of production and transportation</p>
          </div>

          <div className="feature">
            <div className="feature__icon">🌾</div>
            <h3>Land Needed</h3>
            <p>Understand the land requirements for material sourcing</p>
          </div>

          <div className="feature">
            <div className="feature__icon">♻️</div>
            <h3>Lifecycle View</h3>
            <p>Track impacts from production, transport, use, care, to disposal</p>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <h2>Ready to Make Informed Decisions?</h2>
        <p>
          Compare products, read detailed analyses, and understand the real impact 
          of your choices.
        </p>
        <Link to="/products" className="cta-button">
          Start Exploring
        </Link>
      </section>
    </div>
  );
}
