import { useState, useRef } from 'react';
import { translatePdf } from '../services/api';
import './AiPage.css';

const LANGUAGES = [
  'Hindi', 'Spanish', 'French', 'German', 'Chinese', 'Japanese',
  'Arabic', 'Portuguese', 'Russian', 'Korean', 'Italian', 'Dutch',
  'Turkish', 'Thai', 'Vietnamese', 'Indonesian', 'Bengali', 'Tamil',
  'Urdu', 'Marathi',
];

export default function AiTranslator() {
  const [file, setFile] = useState(null);
  const [language, setLanguage] = useState('Hindi');
  const [status, setStatus] = useState('idle');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const fileRef = useRef(null);

  function handleFileChange(e) {
    const f = e.target.files[0];
    if (f) setFile(f);
  }

  async function handleSubmit() {
    if (!file) return;
    setStatus('loading');
    setError('');
    setResult(null);
    setCopied(false);
    try {
      const data = await translatePdf(file, language);
      setResult(data);
      setStatus('done');
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Something went wrong');
      setStatus('error');
    }
  }

  function handleCopy() {
    if (result?.translation) {
      navigator.clipboard.writeText(result.translation);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  function handleDownload() {
    if (!result?.translation) return;
    // Use data URL instead of blob URL for reliable filename in Chrome
    const text = result.translation;
    const encoded = encodeURIComponent(text);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = 'data:text/plain;charset=utf-8,' + encoded;
    a.setAttribute('download', `translated_${language.toLowerCase()}.txt`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  function handleReset() {
    setFile(null);
    setStatus('idle');
    setResult(null);
    setError('');
    if (fileRef.current) fileRef.current.value = '';
  }

  return (
    <div className="ai-page">
      <div className="ai-page-header">
        <div className="ai-badge">✨ AI Powered</div>
        <h2>PDF Translator</h2>
        <p>Upload a PDF and translate its content into any language using AI. Maintains structure and formatting.</p>
      </div>

      {/* Upload Card */}
      <div className={`ai-upload-card ${file ? 'has-file' : ''}`}>
        <input
          ref={fileRef}
          type="file"
          accept=".pdf"
          className="ai-file-input"
          onChange={handleFileChange}
        />
        <div className="ai-upload-icon">📄</div>
        <h3>{file ? 'PDF Selected' : 'Drop your PDF here or click to upload'}</h3>
        <p>{file ? '' : 'Supports any text-based PDF up to 100MB'}</p>
        {file && (
          <div className="ai-file-name">
            📎 {file.name}
          </div>
        )}
      </div>

      {/* Language Selector */}
      <div className="ai-language-row">
        <label htmlFor="ai-lang">Translate to:</label>
        <select
          id="ai-lang"
          className="ai-language-select"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
        >
          {LANGUAGES.map((lang) => (
            <option key={lang} value={lang}>{lang}</option>
          ))}
        </select>
      </div>

      {/* Submit */}
      <button
        className="ai-submit-btn"
        onClick={handleSubmit}
        disabled={!file || status === 'loading'}
      >
        {status === 'loading' && <span className="ai-spinner" />}
        {status === 'loading' ? `Translating to ${language}...` : `🌐 Translate to ${language}`}
      </button>

      {/* Loading Skeleton */}
      {status === 'loading' && (
        <div className="ai-loading">
          <div className="ai-skeleton" />
          <div className="ai-skeleton" />
          <div className="ai-skeleton" />
          <div className="ai-skeleton" />
          <div className="ai-skeleton" />
        </div>
      )}

      {/* Error */}
      {status === 'error' && (
        <div className="ai-error">⚠️ {error}</div>
      )}

      {/* Result */}
      {status === 'done' && result && (
        <div className="ai-result">
          <div className="ai-result-header">
            <div className="ai-result-title">
              <span>🌐</span> {result.language} Translation
            </div>
            <div className="ai-result-actions">
              <button className={`ai-action-btn ${copied ? 'copied' : ''}`} onClick={handleCopy}>
                {copied ? '✓ Copied' : '📋 Copy'}
              </button>
              <button className="ai-action-btn" onClick={handleDownload}>
                ⬇ Download TXT
              </button>
              <button className="ai-action-btn" onClick={handleReset}>
                🔄 New PDF
              </button>
            </div>
          </div>
          <div className="ai-result-content">
            {result.translation}
          </div>
          <div className="ai-result-meta">
            <span>📄 Original: {(result.originalLength / 1000).toFixed(1)}k characters</span>
            <span>🌐 Language: {result.language}</span>
            {result.truncated && <span>⚠️ Text was truncated (very large PDF)</span>}
          </div>
        </div>
      )}
    </div>
  );
}
