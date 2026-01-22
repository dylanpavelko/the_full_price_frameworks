/**
 * LoadingSpinner component shows while data is being loaded
 * 
 * Simple placeholder that appears during async data fetching.
 */
import './LoadingSpinner.css';

export function LoadingSpinner() {
  return (
    <div className="loading-spinner">
      <div className="spinner"></div>
      <p>Loading...</p>
    </div>
  );
}
