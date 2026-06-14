import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './CookieBanner.css';

export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if the user has already accepted cookies
    const cookieConsent = localStorage.getItem('konvert_cookie_consent');
    if (!cookieConsent) {
      // Show banner after a slight delay for better UX
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('konvert_cookie_consent', 'true');
    setIsVisible(false);
  };

  const handleDecline = () => {
    // Usually decline still hides the banner but sets a 'false' value
    localStorage.setItem('konvert_cookie_consent', 'false');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="cookie-banner-overlay">
      <div className="cookie-banner">
        <div className="cookie-banner-content">
          <div className="cookie-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5"></path>
              <path d="M8.5 8.5v.01"></path>
              <path d="M16 12.5v.01"></path>
              <path d="M12 16v.01"></path>
              <path d="M11 12.5v.01"></path>
              <path d="M14.5 9v.01"></path>
            </svg>
          </div>
          <div className="cookie-text">
            <h3>We value your privacy</h3>
            <p>
              We use cookies to enhance your browsing experience, serve personalized content, and analyze our traffic. 
              By clicking "Accept All", you consent to our use of cookies. <Link to="/privacy">Read our Privacy Policy</Link>.
            </p>
          </div>
        </div>
        <div className="cookie-actions">
          <button className="cookie-btn cookie-btn-decline" onClick={handleDecline}>Decline</button>
          <button className="cookie-btn cookie-btn-accept" onClick={handleAccept}>Accept All</button>
        </div>
      </div>
    </div>
  );
}
