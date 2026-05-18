import ToolCard from '../components/ui/ToolCard';
import { wordToPdf } from '../services/api';
import './SubPage.css';

export default function WordToPdf() {
  return (
    <div className="sub-page">
      <h2>Word to PDF</h2>
      <p className="sub-page-desc">
        Convert your Microsoft Word (.docx) documents to high-quality PDF files instantly.
      </p>
      <div className="sub-page-card">
        <ToolCard
          title="Word to PDF"
          color="#2a5699"
          icon={
            <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="8" y="6" width="32" height="36" rx="3" fill="white" fillOpacity="0.9"/>
              <path d="M14 16h20M14 24h20M14 32h12" stroke="#2a5699" strokeWidth="2.5" strokeLinecap="round"/>
              <path d="M30 32l6 6M36 32l-6 6" stroke="#2a5699" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
          }
          fields={[
            { name: 'file', type: 'file', accept: '.docx', required: true },
          ]}
          apiCall={(data) => wordToPdf(data.file)}
        />
      </div>
    </div>
  );
}
