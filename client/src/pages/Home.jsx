import { Link } from 'react-router-dom';
import './Home.css';

const tools = [
  {
    title: 'Merge PDF',
    color: '#e2514a',
    path: '/merge',
    icon: (
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="6" y="8" width="14" height="18" rx="2" fill="white" fillOpacity="0.9"/>
        <rect x="28" y="8" width="14" height="18" rx="2" fill="white" fillOpacity="0.9"/>
        <path d="M13 26v6l11 6 11-6v-6" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    description: 'Combine multiple PDFs into one unified document.',
  },
  {
    title: 'PDF to Word',
    color: '#005a9c',
    path: '/pdf-to-word',
    icon: (
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M26 8v32l-14 4V4l14 4z" fill="white" fillOpacity="0.8"/>
        <path d="M26 12h12v24H26" stroke="white" strokeOpacity="0.8" strokeWidth="2" strokeMiterlimit="10"/>
        <path d="M12 18l3 12h2l2-7 2 7h2l3-12h-2l-2 9-2-7h-2l-2 7-2-9h-2z" fill="white"/>
      </svg>
    ),
    description: 'Convert PDF to an editable Word document.',
  },
  {
    title: 'Word to PDF',
    color: '#2a5699',
    path: '/word-to-pdf',
    icon: (
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="8" y="6" width="32" height="36" rx="3" fill="white" fillOpacity="0.9"/>
        <path d="M14 16h20M14 24h20M14 32h12" stroke="#2a5699" strokeWidth="2.5" strokeLinecap="round"/>
        <path d="M30 32l6 6M36 32l-6 6" stroke="#2a5699" strokeWidth="2.5" strokeLinecap="round"/>
      </svg>
    ),
    description: 'Convert Microsoft Word documents to PDF.',
  },
  {
    title: 'Excel to PDF',
    color: '#1d6f42',
    path: '/excel-to-pdf',
    icon: (
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="8" y="6" width="32" height="36" rx="3" fill="white" fillOpacity="0.9"/>
        <path d="M14 14h20M14 20h20M14 26h20M14 32h20" stroke="#1d6f42" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M20 14v18M28 14v18" stroke="#1d6f42" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    description: 'Convert Excel spreadsheets to PDF tables.',
  },
  {
    title: 'Split PDF',
    color: '#4a90e2',
    path: '/split',
    icon: (
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="8" y="6" width="32" height="36" rx="3" fill="white" fillOpacity="0.9"/>
        <line x1="8" y1="20" x2="40" y2="20" stroke="#4a90e2" strokeWidth="2.5"/>
        <line x1="24" y1="20" x2="24" y2="42" stroke="#4a90e2" strokeWidth="2" strokeDasharray="3 2"/>
      </svg>
    ),
    description: 'Extract specific pages by range.',
  },
  {
    title: 'Compress PDF',
    color: '#2ecc71',
    path: '/compress',
    icon: (
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="8" y="6" width="32" height="36" rx="3" fill="white" fillOpacity="0.9"/>
        <path d="M18 18l6 6 6-6M18 28l6-6 6 6" stroke="#2ecc71" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    description: 'Reduce file size by recompressing images.',
  },
  {
    title: 'Rotate PDF',
    color: '#f39c12',
    path: '/rotate',
    icon: (
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="10" y="10" width="28" height="28" rx="3" fill="white" fillOpacity="0.9"/>
        <path d="M30 10 A14 14 0 0 1 38 24" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
        <polyline points="38,18 38,24 32,24" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    description: 'Rotate all pages by a given angle.',
  },
  {
    title: 'Watermark',
    color: '#9b59b6',
    path: '/watermark',
    icon: (
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="8" y="6" width="32" height="36" rx="3" fill="white" fillOpacity="0.9"/>
        <text x="24" y="30" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#9b59b6" opacity="0.7" fontFamily="Inter, sans-serif">WM</text>
      </svg>
    ),
    description: 'Add a text watermark to every page.',
  },
  {
    title: 'Page Numbers',
    color: '#1abc9c',
    path: '/page-numbers',
    icon: (
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="8" y="6" width="32" height="36" rx="3" fill="white" fillOpacity="0.9"/>
        <line x1="14" y1="16" x2="34" y2="16" stroke="#1abc9c" strokeWidth="2" strokeLinecap="round"/>
        <line x1="14" y1="22" x2="34" y2="22" stroke="#1abc9c" strokeWidth="2" strokeLinecap="round"/>
        <line x1="14" y1="28" x2="28" y2="28" stroke="#1abc9c" strokeWidth="2" strokeLinecap="round"/>
        <text x="36" y="40" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#1abc9c" fontFamily="Inter,sans-serif">1</text>
      </svg>
    ),
    description: 'Add page numbers to the bottom right.',
  },
  {
    title: 'Protect PDF',
    color: '#e74c3c',
    path: '/protect',
    icon: (
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M24 6L10 12v12c0 8 6 15 14 18 8-3 14-10 14-18V12L24 6z" fill="white" fillOpacity="0.9"/>
        <rect x="19" y="22" width="10" height="8" rx="1.5" fill="#e74c3c"/>
        <path d="M20 22v-3a4 4 0 018 0v3" stroke="#e74c3c" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
    description: 'Encrypt your PDF with a password.',
  },
  {
    title: 'Unlock PDF',
    color: '#e67e22',
    path: '/unlock',
    icon: (
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="12" y="22" width="24" height="18" rx="3" fill="white" fillOpacity="0.9"/>
        <path d="M18 22v-5a6 6 0 0112 0" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
        <circle cx="24" cy="31" r="2.5" fill="#e67e22"/>
      </svg>
    ),
    description: 'Remove password protection from PDF.',
  },
  {
    title: 'Images → PDF',
    color: '#3498db',
    path: '/images-to-pdf',
    icon: (
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="6" y="10" width="24" height="20" rx="3" fill="white" fillOpacity="0.8"/>
        <rect x="18" y="18" width="24" height="20" rx="3" fill="white" fillOpacity="0.95"/>
        <circle cx="14" cy="17" r="3" fill="#3498db" opacity="0.6"/>
        <path d="M10 26l4-4 4 4 4-6 4 6" stroke="#3498db" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    description: 'Convert images to a single PDF.',
  },
  {
    title: 'Edit PDF',
    color: '#8e44ad',
    path: '/edit-pdf',
    icon: (
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="8" y="6" width="32" height="36" rx="3" fill="white" fillOpacity="0.9"/>
        <path d="M30 14l4 4-12 12H18v-4l12-12z" fill="#8e44ad" opacity="0.85"/>
        <path d="M14 38h20" stroke="#8e44ad" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
    description: 'Open a PDF and add or edit text directly.',
  },
  {
    title: 'Reorder Pages',
    color: '#f39c12',
    path: '/reorder',
    icon: (
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="8" y="6" width="32" height="36" rx="3" fill="white" fillOpacity="0.9"/>
        <path d="M16 16h16M16 24h16M16 32h16" stroke="#f39c12" strokeWidth="2" strokeLinecap="round"/>
        <path d="M12 16l-3 3 3 3M36 24l3-3-3-3M12 32l-3 3 3 3" stroke="#f39c12" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    description: 'Reorder or delete pages from your PDF.',
  },
  {
    title: 'Extract Text',
    color: '#2ecc71',
    path: '/extract',
    icon: (
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="8" y="6" width="32" height="36" rx="3" fill="white" fillOpacity="0.9"/>
        <path d="M16 16h16M16 22h12M16 28h14" stroke="#2ecc71" strokeWidth="2" strokeLinecap="round"/>
        <path d="M30 32l6 6M36 32l-6 6" stroke="#2ecc71" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
    description: 'Extract all text from a PDF as a .txt file.',
  },
  {
    title: 'Metadata',
    color: '#9b59b6',
    path: '/metadata',
    icon: (
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="8" y="6" width="32" height="36" rx="3" fill="white" fillOpacity="0.9"/>
        <circle cx="24" cy="18" r="4" fill="#9b59b6" opacity="0.7"/>
        <path d="M14 34h20M14 28h20" stroke="#9b59b6" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
    description: 'Edit title, author, subject, and keywords.',
  },
  {
    title: 'PDF → Images',
    color: '#3498db',
    path: '/pdf-to-images',
    icon: (
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="8" y="6" width="32" height="36" rx="3" fill="white" fillOpacity="0.9"/>
        <circle cx="18" cy="18" r="4" fill="#3498db" opacity="0.6"/>
        <path d="M12 34l8-10 6 7 4-5 6 8" stroke="#3498db" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    description: 'Split PDF into individual page images.',
  },
  {
    title: 'AI Summarizer',
    color: '#667eea',
    path: '/ai-summarizer',
    isAi: true,
    icon: (
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="8" y="6" width="32" height="36" rx="3" fill="white" fillOpacity="0.9"/>
        <path d="M16 16h16M16 22h12M16 28h14" stroke="#667eea" strokeWidth="2" strokeLinecap="round"/>
        <circle cx="34" cy="34" r="8" fill="#667eea"/>
        <text x="34" y="37.5" textAnchor="middle" fontSize="10" fontWeight="bold" fill="white" fontFamily="Inter,sans-serif">✦</text>
      </svg>
    ),
    description: 'AI-powered summary of any PDF in seconds.',
  },
  {
    title: 'AI Translator',
    color: '#764ba2',
    path: '/ai-translator',
    isAi: true,
    icon: (
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="8" y="6" width="32" height="36" rx="3" fill="white" fillOpacity="0.9"/>
        <text x="18" y="24" fontSize="11" fontWeight="bold" fill="#764ba2" fontFamily="Inter,sans-serif">A</text>
        <path d="M24 20l4 0" stroke="#764ba2" strokeWidth="2" strokeLinecap="round"/>
        <text x="32" y="34" fontSize="11" fontWeight="bold" fill="#764ba2" fontFamily="Inter,sans-serif" opacity="0.7">अ</text>
        <circle cx="34" cy="34" r="8" fill="#764ba2"/>
        <text x="34" y="37.5" textAnchor="middle" fontSize="10" fontWeight="bold" fill="white" fontFamily="Inter,sans-serif">🌐</text>
      </svg>
    ),
    description: 'Translate PDF content to any language using AI.',
  },
  {
    title: 'Image Editor',
    color: '#0ea5e9',
    path: '/image-editor',
    icon: (
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="6" y="8" width="36" height="28" rx="3" fill="white" fillOpacity="0.9"/>
        <circle cx="17" cy="19" r="4" fill="#0ea5e9" opacity="0.7"/>
        <path d="M6 28l10-10 8 8 6-6 10 8" stroke="#0ea5e9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <rect x="14" y="38" width="20" height="3" rx="1.5" fill="white" fillOpacity="0.7"/>
        <circle cx="38" cy="10" r="6" fill="#0ea5e9"/>
        <path d="M35 10h6M38 7v6" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    ),
    description: 'Remove backgrounds, resize, and convert images — all in-browser.',
  },
];

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="hero">
        <h1>Every tool you need to work with PDFs</h1>
        <p className="hero-sub">
          All are <strong>100% FREE</strong> and easy to use! Merge, split, compress,
          protect, and convert PDFs with just a few clicks.
        </p>
      </section>

      {/* Tool Grid */}
      <section className="tools-section">
        <div className="tools-grid">
          {tools.map((tool) => (
            <Link
              key={tool.title}
              to={tool.path}
              className={`tool-card tool-card-link${tool.isAi ? ' tool-card-ai' : ''}`}
              style={{ '--card-color': tool.color, textDecoration: 'none' }}
            >
              {tool.isAi && <span className="tool-ai-tag">✨ AI</span>}
              <div className="tool-icon-box">
                {tool.icon}
              </div>
              <h3>{tool.title}</h3>
              <p className="tool-description">{tool.description}</p>
              <div className="tool-card-arrow">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M7 4l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Feature Banner */}
      <section className="feature-banner">
        <div className="feature-banner-inner">
          <div className="feature-item">
            <span className="feature-icon">🔒</span>
            <div>
              <strong>Secure &amp; Private</strong>
              <p>Files are processed locally and deleted after download.</p>
            </div>
          </div>
          <div className="feature-item">
            <span className="feature-icon">⚡</span>
            <div>
              <strong>Fast Processing</strong>
              <p>High-performance Node.js backend for instant results.</p>
            </div>
          </div>
          <div className="feature-item">
            <span className="feature-icon">🆓</span>
            <div>
              <strong>Always Free</strong>
              <p>All tools are completely free, no account required.</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
