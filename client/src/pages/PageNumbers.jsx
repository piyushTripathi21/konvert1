import ToolCard from '../components/ui/ToolCard';
import { paginatePdf } from '../services/api';
import './SubPage.css';

export default function PageNumbers() {
  return (
    <div className="sub-page">
      <h2>Add Page Numbers</h2>
      <p className="sub-page-desc">
        Add page numbers to the bottom right of every page in your PDF.
      </p>
      <div className="sub-page-card">
        <ToolCard
          title="Page Numbers"
          color="#1abc9c"
          icon={
            <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="8" y="6" width="32" height="36" rx="3" fill="white" fillOpacity="0.9"/>
              <line x1="14" y1="16" x2="34" y2="16" stroke="#1abc9c" strokeWidth="2" strokeLinecap="round"/>
              <line x1="14" y1="22" x2="34" y2="22" stroke="#1abc9c" strokeWidth="2" strokeLinecap="round"/>
              <line x1="14" y1="28" x2="28" y2="28" stroke="#1abc9c" strokeWidth="2" strokeLinecap="round"/>
              <text x="36" y="40" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#1abc9c" fontFamily="Inter,sans-serif">1</text>
            </svg>
          }
          fields={[
            { name: 'file', type: 'file', accept: '.pdf', required: true },
          ]}
          apiCall={(data) => paginatePdf(data.file)}
        />
      </div>
    </div>
  );
}
