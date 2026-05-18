import { Link } from 'react-router-dom';
import './Footer.css';

/* ── Tool categories ── */
const CATEGORIES = [
  {
    title: 'PDF Tools',
    icon: '📄',
    color: '#e2514a',
    tools: [
      { label: 'Merge PDF',       path: '/merge' },
      { label: 'Split PDF',       path: '/split' },
      { label: 'Compress PDF',    path: '/compress' },
      { label: 'PDF to Word',     path: '/pdf-to-word' },
      { label: 'Rotate PDF',      path: '/rotate' },
      { label: 'Watermark',       path: '/watermark' },
      { label: 'Page Numbers',    path: '/page-numbers' },
      { label: 'Protect PDF',     path: '/protect' },
      { label: 'Unlock PDF',      path: '/unlock' },
      { label: 'Reorder Pages',   path: '/reorder' },
      { label: 'Extract Text',    path: '/extract' },
      { label: 'Metadata',        path: '/metadata' },
    ],
  },
  {
    title: 'Convert',
    icon: '🔄',
    color: '#3498db',
    tools: [
      { label: 'PDF → Word',      path: '/pdf-to-word' },
      { label: 'PDF → Images',    path: '/pdf-to-images' },
      { label: 'Images → PDF',    path: '/images-to-pdf' },
      { label: 'Image Editor',    path: '/image-editor' },
      { label: 'Edit PDF',        path: '/edit-pdf' },
    ],
  },
  {
    title: 'AI Tools',
    icon: '✨',
    color: '#667eea',
    tools: [
      { label: 'AI Summarizer',   path: '/ai-summarizer' },
      { label: 'AI Translator',   path: '/ai-translator' },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="footer">
      {/* Top: brand + category columns */}
      <div className="footer-top">

        {/* Brand */}
        <div className="footer-brand-col">
          <div className="footer-logo-row">
            <div className="footer-logo-box">K</div>
            <span className="footer-brand-name">Konvert</span>
          </div>
          <p className="footer-tagline">
            Every tool you need to work with PDFs and images — fast, free, and secure.
          </p>
          <div className="footer-socials">
            <a className="footer-social-btn" href="https://github.com" target="_blank" rel="noreferrer" title="GitHub">🐙</a>
            <a className="footer-social-btn" href="https://twitter.com" target="_blank" rel="noreferrer" title="Twitter">🐦</a>
            <a className="footer-social-btn" href="mailto:support@konvert.app" title="Email">✉️</a>
          </div>
        </div>

        {/* Category columns */}
        {CATEGORIES.map((cat) => (
          <div className="footer-cat-col" key={cat.title}>
            <div className="footer-cat-header">
              <span className="footer-cat-icon">{cat.icon}</span>
              <span className="footer-cat-title">{cat.title}</span>
              <span className="footer-scroll-hint">↕</span>
            </div>

            <div className="footer-tool-list">
              {cat.tools.map((tool) => (
                <Link
                  key={tool.path + tool.label}
                  to={tool.path}
                  className="footer-tool-link"
                >
                  <span
                    className="footer-tool-dot"
                    style={{ background: cat.color }}
                  />
                  {tool.label}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      <hr className="footer-divider" />

      {/* Bottom bar */}
      <div className="footer-bottom">
        <span className="footer-copy">
          © {new Date().getFullYear()} Konvert. All rights reserved.
        </span>
        <div className="footer-bottom-links">
          <a href="/">About</a>
          <a href="/">Privacy</a>
          <a href="/">Terms</a>
          <a href="/">Contact</a>
        </div>
      </div>
    </footer>
  );
}
