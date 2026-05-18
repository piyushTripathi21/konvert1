import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import SignInModal from '../ui/SignInModal';
import './Header.css';

const CATEGORIES = [
  {
    title: 'PDF Tools',
    tools: [
      { label: 'Merge PDF',       path: '/merge',       icon: '📄', color: '#e2514a' },
      { label: 'Split PDF',       path: '/split',       icon: '✂️', color: '#4a90e2' },
      { label: 'Compress PDF',    path: '/compress',    icon: '🗜️', color: '#2ecc71' },
      { label: 'Rotate PDF',      path: '/rotate',      icon: '🔄', color: '#f39c12' },
      { label: 'Watermark',       path: '/watermark',   icon: '©️', color: '#9b59b6' },
      { label: 'Page Numbers',    path: '/page-numbers',icon: '#️⃣', color: '#1abc9c' },
      { label: 'Protect PDF',     path: '/protect',     icon: '🔒', color: '#e74c3c' },
      { label: 'Unlock PDF',      path: '/unlock',      icon: '🔓', color: '#e67e22' },
      { label: 'Reorder Pages',   path: '/reorder',     icon: '📑', color: '#f39c12' },
      { label: 'Extract Text',    path: '/extract',     icon: '📝', color: '#2ecc71' },
      { label: 'Metadata',        path: '/metadata',    icon: '🏷️', color: '#9b59b6' },
    ],
  },
  {
    title: 'Convert',
    tools: [
      { label: 'PDF → Word',      path: '/pdf-to-word',   icon: '🇼', color: '#005a9c' },
      { label: 'Word → PDF',      path: '/word-to-pdf',   icon: '📄', color: '#2a5699' },
      { label: 'Excel → PDF',     path: '/excel-to-pdf',  icon: '📊', color: '#1d6f42' },
      { label: 'PDF → Images',    path: '/pdf-to-images', icon: '🖼️', color: '#3498db' },
      { label: 'Images → PDF',    path: '/images-to-pdf', icon: '📸', color: '#3498db' },
      { label: 'Image Editor',    path: '/image-editor',  icon: '🎨', color: '#0ea5e9' },
      { label: 'Edit PDF',        path: '/edit-pdf',      icon: '✍️', color: '#8e44ad' },
    ],
  },
  {
    title: 'AI Tools',
    tools: [
      { label: 'AI Summarizer',   path: '/ai-summarizer', icon: '✨', color: '#667eea' },
      { label: 'AI Translator',   path: '/ai-translator', icon: '🌐', color: '#764ba2' },
    ],
  },
];

export default function Header() {
  const location = useLocation();
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <header className="site-header">
        <div className="header-inner">
          <Link to="/" className="brand">
            <div className="logo">K</div>
            <div className="brand-name">Konvert</div>
          </Link>
          <nav className="header-nav">
            <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>
              Home
            </Link>

            {CATEGORIES.map((cat) => (
              <div className="nav-dropdown" key={cat.title}>
                <button className="nav-dropdown-btn">
                  {cat.title}
                  <span className="nav-caret">▼</span>
                </button>
                <div className="nav-mega">
                  <div className="mega-cat-label">{cat.title}</div>
                  <div className="mega-tool-list">
                    {cat.tools.map((tool) => (
                      <Link
                        key={tool.path}
                        to={tool.path}
                        className="mega-tool-link"
                      >
                        <div className="mega-tool-icon" style={{ background: `${tool.color}15`, color: tool.color }}>
                          {tool.icon}
                        </div>
                        {tool.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            ))}

            <button className="nav-btn" onClick={() => setShowModal(true)}>
              Sign In
            </button>
          </nav>
        </div>
      </header>

      {showModal && <SignInModal onClose={() => setShowModal(false)} />}
    </>
  );
}
