import { useState, useRef } from 'react';
import { summarizePdf } from '../services/api';
import './AiPage.css';

export default function AiSummarizer() {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('idle'); // idle | loading | done | error
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
      const data = await summarizePdf(file);
      setResult(data);
      setStatus('done');
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Something went wrong');
      setStatus('error');
    }
  }

  function handleCopy() {
    if (result?.summary) {
      navigator.clipboard.writeText(result.summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  function handleDownload() {
    if (!result?.summary) return;
    const text = result.summary;
    const encoded = encodeURIComponent(text);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = 'data:text/plain;charset=utf-8,' + encoded;
    a.setAttribute('download', 'summary.txt');
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
        <h2>PDF Summarizer</h2>
        <p>Upload any PDF and get an instant, AI-generated summary with key points, highlights, and a TL;DR.</p>
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

      {/* Submit */}
      <button
        className="ai-submit-btn"
        onClick={handleSubmit}
        disabled={!file || status === 'loading'}
      >
        {status === 'loading' && <span className="ai-spinner" />}
        {status === 'loading' ? 'Analyzing with AI...' : '✨ Summarize PDF'}
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
              <span>📋</span> AI Summary
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
            {result.summary}
          </div>
          <div className="ai-result-meta">
            <span>📄 Original: {(result.originalLength / 1000).toFixed(1)}k characters</span>
            {result.truncated && <span>⚠️ Text was truncated (very large PDF)</span>}
          </div>
        </div>
      )}
    </div>
  );
}
