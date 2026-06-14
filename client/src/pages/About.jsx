import { useEffect } from 'react';
import SEOHelmet from '../components/seo/SEOHelmet';
import './About.css';

export default function About() {
  // Scroll to top on load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="about-page-container">
      <SEOHelmet
        title="About Us — Our Story & Team"
        description="Learn about Konvert — built by co-founders Piyush Tripathi and Pradeep Gupta to make document management effortless, free, and private for everyone."
        keywords="about konvert, konvert team, piyush tripathi, pradeep gupta, pdf tool india"
        canonical="/about"
      />
      {/* Hero Section */}
      <section className="about-hero">
        <div className="about-hero-content">
          <h1>Our Story</h1>
          <p className="about-hero-sub">
            Simplifying document management for everyone, everywhere.
          </p>
        </div>
      </section>

      {/* Story Content Section */}
      <section className="about-story-section">
        <div className="about-story-inner">
          <div className="story-text-block">
            <p>
              The <strong>Konvert</strong> team is here to make managing documents effortless. From firsthand experience,
              we know that dealing with PDF files and images can be very time-consuming. Wouldn't it be
              better if your time was well spent on what truly matters, instead of stressing over complex file formats?
            </p>
            <p>
              Born out of a personal need for a faster, safer, and entirely local toolkit, Konvert was created to offer
              a <strong>free, accessible, and top-quality service</strong> that is extremely easy to use. What started as a project to solve
              our own frustrations has evolved into a comprehensive suite of tools, from basic merges to advanced AI integrations.
            </p>
            <p>
              To meet as many of your needs as possible, we have developed local browser processing features alongside a powerful Node.js engine.
              All file modifications are secure, respecting your privacy by processing files locally and cleaning them up instantly.
            </p>
            <p>
              Your trust is what drives us forward. Our small team works tirelessly to expand our toolkit features and deliver the best editing experience.
            </p>
          </div>
        </div>
      </section>

      {/* The Team Section */}
      <section className="about-team-section">
        <div className="about-team-inner">
          <h2>The Team</h2>
          <p className="team-intro">
            We are a small, passionate team who enjoy creating software solutions to help people around the world with their document workflows.
          </p>

          <div className="team-grid">
            {/* Member 1: Piyush */}
            <div className="team-member-card">
              <div className="member-avatar-wrapper">
                <img src="/piyush-founder.jpg" alt="Piyush Tripathi" className="member-avatar" />
                <a 
                  href="https://www.linkedin.com/in/piyush-tripathi-105324321/" 
                  className="member-badge badge-linkedin" 
                  title="Piyush Tripathi on LinkedIn" 
                  target="_blank" 
                  rel="noreferrer"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                  </svg>
                </a>
              </div>
              <h3 className="member-name">Piyush Tripathi</h3>
              <p className="member-role">Co-founder &amp; CEO</p>
            </div>

            {/* Member 2: Pradeep */}
            <div className="team-member-card">
              <div className="member-avatar-wrapper">
                <img src="/pradeep-founder.jpg" alt="Pradeep Gupta" className="member-avatar" />
                <a 
                  href="https://www.linkedin.com/in/pradeepgupta7/" 
                  className="member-badge badge-linkedin" 
                  title="Pradeep Gupta on LinkedIn" 
                  target="_blank" 
                  rel="noreferrer"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                  </svg>
                </a>
              </div>
              <h3 className="member-name">Pradeep Gupta</h3>
              <p className="member-role">Co-founder &amp; CTO</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
