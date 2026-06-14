import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SEOHelmet from '../components/seo/SEOHelmet';
import './Faq.css';

const FAQ_DATA = [
  {
    category: 'General',
    icon: '💡',
    questions: [
      {
        q: 'What is Konvert?',
        a: 'Konvert is a free, all-in-one PDF and image toolkit built for speed, security, and simplicity. You can merge, split, compress, rotate, protect, watermark PDFs, convert between formats, and even use AI features like document summarization and translation — all in one place, completely free.',
      },
      {
        q: 'Is Konvert really free? Are there any hidden charges?',
        a: 'Yes, 100% free. There are no hidden fees, no subscriptions, and no premium-locked features. Every tool on Konvert is completely free to use without creating an account.',
      },
      {
        q: 'Do I need to create an account to use Konvert?',
        a: 'No account is required to use most tools. You can start working with your files instantly. An optional account may be introduced in the future for saving history and preferences.',
      },
      {
        q: 'Which devices and browsers does Konvert support?',
        a: 'Konvert works on all modern browsers including Chrome, Firefox, Edge, and Safari on Windows, macOS, Android, and iOS. Some editing tools work best on desktop for full productivity.',
      },
    ],
  },
  {
    category: 'Privacy & Security',
    icon: '🔒',
    questions: [
      {
        q: 'Are my uploaded files secure?',
        a: 'Absolutely. All files are processed over an encrypted HTTPS connection. Your documents are stored only for the duration of processing and are permanently deleted from our servers within 10 minutes automatically. We never share or inspect your file contents.',
      },
      {
        q: 'Does Konvert keep copies of my files after download?',
        a: 'No. Once you download the processed output, our automated cleanup system permanently removes all traces of your file from our servers within 10 minutes. We retain no backups or copies of user documents.',
      },
      {
        q: 'Are my documents seen by anyone at Konvert?',
        a: 'Never. Your files are processed automatically by our server — no human ever reads, views, or accesses the content of your uploaded documents.',
      },
      {
        q: 'What happens when I use the AI features (Summarizer, Translator, Chat)?',
        a: 'When you use AI features, the readable text content of your PDF is extracted and sent securely to Google\'s Gemini AI API to generate the response. Only text content is shared (not the binary file itself), and it is processed statelessly — it is not stored or used to train any AI model.',
      },
    ],
  },
  {
    category: 'PDF Tools',
    icon: '📄',
    questions: [
      {
        q: 'How do I merge multiple PDFs into one?',
        a: 'Go to the Merge PDF tool, upload the PDF files you want to combine, arrange them in the order you prefer, and click "Merge". Your combined PDF will be ready to download in seconds.',
      },
      {
        q: 'How do I compress a PDF without losing quality?',
        a: 'Use the Compress PDF tool. Upload your file and Konvert will intelligently re-compress embedded images and remove unnecessary data to reduce file size while preserving the best possible visual quality.',
      },
      {
        q: 'Can I split a PDF into multiple separate files?',
        a: 'Yes! The Split PDF tool lets you extract specific page ranges. Enter the start and end page numbers for each part, and Konvert will generate separate PDF files for each range.',
      },
      {
        q: 'How do I add a password to my PDF?',
        a: 'Use the Protect PDF tool. Upload your PDF, set a password, and download the encrypted version. Anyone who tries to open the file will need your password.',
      },
      {
        q: 'Can I remove a password from a PDF I own?',
        a: 'Yes, the Unlock PDF tool can remove password protection from PDFs. You will need to enter the existing password first to verify ownership before the lock is removed.',
      },
      {
        q: 'How do I add a watermark to a PDF?',
        a: 'Go to the Watermark tool, upload your PDF, type the watermark text (e.g. "Confidential" or your company name), choose the opacity and position, and download the watermarked file.',
      },
    ],
  },
  {
    category: 'File Conversion',
    icon: '🔄',
    questions: [
      {
        q: 'Can I convert a PDF to a Word document?',
        a: 'Yes! Use the PDF → Word tool. Your PDF will be converted to an editable .docx file that you can open and modify in Microsoft Word, Google Docs, or any compatible editor.',
      },
      {
        q: 'Can I convert a Word document to PDF?',
        a: 'Yes. The Word → PDF tool accepts .doc and .docx files and converts them to a clean, professional PDF in seconds.',
      },
      {
        q: 'Can I convert Excel spreadsheets to PDF?',
        a: 'Yes! The Excel → PDF tool accepts .xls and .xlsx files and renders them as properly formatted PDF pages.',
      },
      {
        q: 'Can I convert PDF pages into images?',
        a: 'Yes. The PDF → Images tool converts every page of your PDF into high-quality PNG image files, which you can then download as a ZIP archive.',
      },
      {
        q: 'Can I combine multiple images into a single PDF?',
        a: 'Absolutely. The Images → PDF tool accepts JPG, PNG, and WebP files. Upload all your images, arrange them in the correct order, and click Convert to get a single PDF.',
      },
    ],
  },
  {
    category: 'AI Features',
    icon: '✨',
    questions: [
      {
        q: 'What AI features does Konvert offer?',
        a: 'Konvert offers three AI-powered tools: (1) AI Summarizer — generates a concise summary of any PDF document. (2) AI Translator — translates the content of a PDF into your chosen language. (3) Chat with PDF — lets you ask questions about your document and receive intelligent answers powered by Google Gemini AI.',
      },
      {
        q: 'Which AI model powers the AI features?',
        a: 'Konvert\'s AI features are powered by Google\'s Gemini AI — one of the most advanced large language models available, designed for understanding, summarizing, and translating documents accurately.',
      },
      {
        q: 'Is there a file size limit for AI tools?',
        a: 'AI features work best with text-based PDFs. Very large or heavily scanned PDFs (image-only, without embedded text) may have limited AI accuracy. For best results, use PDFs under 50MB with extractable text content.',
      },
      {
        q: 'What languages does the AI Translator support?',
        a: 'The AI Translator supports a wide range of languages including Hindi, Spanish, French, German, Arabic, Chinese, Japanese, Portuguese, Russian, and many more — powered by Google Gemini\'s multilingual capability.',
      },
    ],
  },
  {
    category: 'Image Editor',
    icon: '🖼️',
    questions: [
      {
        q: 'What can I do with the Image Editor?',
        a: 'The Konvert Image Editor is a full in-browser editor. You can remove backgrounds from images, resize and crop, convert between formats (JPG, PNG, WebP), and adjust brightness or contrast — all without any upload to a server.',
      },
      {
        q: 'Does the Image Editor work without uploading my photo to a server?',
        a: 'Yes! The Image Editor processes your images entirely in your browser using local WebAssembly and canvas technology. Your photos never leave your device for basic operations like crop, resize, and format conversion.',
      },
    ],
  },
  {
    category: 'Troubleshooting',
    icon: '🛠️',
    questions: [
      {
        q: 'My file upload seems stuck or slow. What should I do?',
        a: 'Large files may take a moment to upload depending on your internet connection speed. If it stays stuck for more than 60 seconds, try refreshing the page and re-uploading. Make sure your file is not password-protected before uploading to processing tools.',
      },
      {
        q: 'The converted file looks different from the original. Why?',
        a: 'Some complex formatting (special fonts, embedded objects, advanced layouts) may change slightly during conversion — this is a limitation of document conversion technology in general. For best results, use standard fonts and layouts in your original document.',
      },
      {
        q: 'I have a feature request or found a bug. How do I report it?',
        a: 'We\'d love to hear from you! Please use our Contact page or email us directly at konvert.dev@gmail.com. Our co-founders personally review all feedback and typically respond within 2 hours.',
      },
    ],
  },
];

export default function Faq() {
  const [openItems, setOpenItems] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const toggleItem = (categoryIndex, questionIndex) => {
    const key = `${categoryIndex}-${questionIndex}`;
    setOpenItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const isOpen = (categoryIndex, questionIndex) =>
    !!openItems[`${categoryIndex}-${questionIndex}`];

  const allCategories = ['All', ...FAQ_DATA.map((c) => c.category)];

  const filteredData = useMemo(() => {
    return FAQ_DATA.map((cat) => ({
      ...cat,
      questions: cat.questions.filter((item) => {
        const matchesCategory =
          activeCategory === 'All' || activeCategory === cat.category;
        const matchesSearch =
          searchQuery.trim() === '' ||
          item.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.a.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
      }),
    })).filter((cat) => cat.questions.length > 0);
  }, [searchQuery, activeCategory]);

  const totalResults = filteredData.reduce(
    (acc, cat) => acc + cat.questions.length,
    0
  );

  return (
    <div className="faq-page-container">
      <SEOHelmet
        title="FAQ — Frequently Asked Questions"
        description="Got questions about Konvert? Find answers about file security, privacy, PDF tools, AI features, conversions, and more in our comprehensive FAQ section."
        keywords="konvert faq, pdf tool help, how to merge pdf, how to compress pdf, pdf security, ai pdf questions"
        canonical="/faq"
      />
      {/* Hero */}
      <section className="faq-hero">
        <div className="faq-hero-content">
          <div className="faq-hero-badge">Help Center</div>
          <h1>Frequently Asked Questions</h1>
          <p className="faq-hero-sub">
            Quick answers to the most common questions about Konvert's tools,
            privacy, and features.
          </p>

          {/* Search Bar */}
          <div className="faq-search-wrapper">
            <span className="faq-search-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
            </span>
            <input
              id="faq-search"
              type="text"
              className="faq-search-input"
              placeholder="Search questions... (e.g. compress, password, AI)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoComplete="off"
            />
            {searchQuery && (
              <button
                className="faq-search-clear"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Category Filter Tabs */}
      <div className="faq-category-tabs-wrapper">
        <div className="faq-category-tabs">
          {allCategories.map((cat) => (
            <button
              key={cat}
              className={`faq-cat-tab ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat === 'All'
                ? '⚡ All Topics'
                : `${FAQ_DATA.find((c) => c.category === cat)?.icon} ${cat}`}
            </button>
          ))}
        </div>
      </div>

      {/* FAQ Content */}
      <section className="faq-content-section">
        <div className="faq-content-inner">
          {filteredData.length === 0 ? (
            <div className="faq-no-results">
              <div className="faq-no-results-icon">🔍</div>
              <h3>No results found</h3>
              <p>Try different keywords or browse all categories.</p>
              <button
                className="faq-clear-btn"
                onClick={() => {
                  setSearchQuery('');
                  setActiveCategory('All');
                }}
              >
                Clear filters
              </button>
            </div>
          ) : (
            <>
              {searchQuery && (
                <p className="faq-results-count">
                  {totalResults} result{totalResults !== 1 ? 's' : ''} for{' '}
                  <strong>"{searchQuery}"</strong>
                </p>
              )}

              {filteredData.map((cat, catIdx) => {
                // Find original index in FAQ_DATA
                const originalCatIdx = FAQ_DATA.findIndex(
                  (c) => c.category === cat.category
                );
                return (
                  <div key={cat.category} className="faq-category-block">
                    <div className="faq-category-label">
                      <span className="faq-category-label-icon">{cat.icon}</span>
                      <span>{cat.category}</span>
                    </div>

                    <div className="faq-accordion">
                      {cat.questions.map((item, qIdx) => {
                        // Find original question index for toggle tracking
                        const originalQIdx = FAQ_DATA[originalCatIdx].questions.findIndex(
                          (q) => q.q === item.q
                        );
                        const open = isOpen(originalCatIdx, originalQIdx);

                        return (
                          <div
                            key={item.q}
                            className={`faq-item ${open ? 'open' : ''}`}
                          >
                            <button
                              className="faq-question-btn"
                              onClick={() =>
                                toggleItem(originalCatIdx, originalQIdx)
                              }
                              aria-expanded={open}
                            >
                              <span className="faq-question-text">{item.q}</span>
                              <span className="faq-chevron">
                                <svg
                                  width="20"
                                  height="20"
                                  viewBox="0 0 20 20"
                                  fill="none"
                                >
                                  <path
                                    d="M5 7.5L10 12.5L15 7.5"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              </span>
                            </button>
                            <div className="faq-answer-wrapper">
                              <div className="faq-answer">{item.a}</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>
      </section>

      {/* Still Need Help CTA */}
      <section className="faq-cta-section">
        <div className="faq-cta-card">
          <div className="faq-cta-icon">💬</div>
          <h2>Still have a question?</h2>
          <p>
            Our co-founders personally respond to every message. Average reply
            time is under 2 hours.
          </p>
          <div className="faq-cta-actions">
            <Link to="/contact" className="faq-cta-btn primary">
              Contact Us
            </Link>
            <a
              href="mailto:konvert.dev@gmail.com"
              className="faq-cta-btn secondary"
            >
              ✉️ konvert.dev@gmail.com
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
